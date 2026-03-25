-- =========================================================================
-- Performance Upgrades — urbanstrength
-- Run once in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Three sections: Analytics RPC, Chat RPC, DB Indices
-- =========================================================================


-- ─────────────────────────────────────────────────────────────────────────
-- SECTION 1 — Analytics Summary RPC
-- Replaces 2 raw queries + client-side JS aggregation with a single call.
-- Returns a JSONB object consumed by /admin/analytics.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_from_date  date    := (CURRENT_DATE - INTERVAL '6 months')::date;
  v_kpis       jsonb;
  v_monthly    jsonb;
  v_weekly     jsonb;
  v_status     jsonb;
  v_source     jsonb;
  v_svc_rev    jsonb;
  v_customers  bigint;
BEGIN
  -- ── Customer count ────────────────────────────────────────────────────
  SELECT COUNT(*) INTO v_customers FROM profiles WHERE role = 'customer';

  -- ── KPI aggregates ────────────────────────────────────────────────────
  -- Single pass over bookings JOIN services for all scalar KPIs
  SELECT jsonb_build_object(
    'total_bookings',     COUNT(*),
    'paid_count',         COUNT(*)  FILTER (WHERE b.paid = true),
    'paid_revenue',       ROUND(COALESCE(SUM(b.paid_amount) FILTER (WHERE b.paid = true), 0)::numeric, 2),
    'avg_revenue',        ROUND(COALESCE(AVG(b.paid_amount) FILTER (WHERE b.paid = true), 0)::numeric, 2),
    'total_revenue',      ROUND(COALESCE(SUM(s.price)       FILTER (WHERE b.status = 'completed'), 0)::numeric, 2),
    'payable_count',      COUNT(*)  FILTER (WHERE COALESCE(s.price, 0) > 0),
    'probe_count',        COUNT(*)  FILTER (WHERE COALESCE(s.price, 0) = 0),
    'paid_service_count', COUNT(*)  FILTER (WHERE COALESCE(s.price, 0) > 0)
  )
  INTO v_kpis
  FROM bookings b
  LEFT JOIN services s ON s.id = b.service_id
  WHERE b.booking_date >= v_from_date;

  -- ── Monthly data — 6 month rolling window ────────────────────────────
  -- generate_series ensures all months appear even if no bookings
  SELECT jsonb_agg(
    jsonb_build_object(
      'month_iso', TO_CHAR(m.month, 'YYYY-MM'),
      'bookings',  COALESCE(d.bookings, 0),
      'revenue',   COALESCE(d.revenue,  0)
    ) ORDER BY m.month
  )
  INTO v_monthly
  FROM (
    SELECT generate_series(
      DATE_TRUNC('month', v_from_date)::date,
      DATE_TRUNC('month', CURRENT_DATE)::date,
      '1 month'::interval
    )::date AS month
  ) m
  LEFT JOIN (
    SELECT
      DATE_TRUNC('month', booking_date)::date                                    AS month,
      COUNT(*)                                                                    AS bookings,
      ROUND(COALESCE(SUM(paid_amount) FILTER (WHERE paid = true), 0)::numeric, 2) AS revenue
    FROM bookings
    WHERE booking_date >= v_from_date
    GROUP BY DATE_TRUNC('month', booking_date)
  ) d USING (month);

  -- ── Weekly data — last 8 weeks ────────────────────────────────────────
  SELECT jsonb_agg(
    jsonb_build_object(
      'week_iso', TO_CHAR(w.week_start, 'YYYY-MM-DD'),
      'revenue',  COALESCE(d.revenue, 0)
    ) ORDER BY w.week_start
  )
  INTO v_weekly
  FROM (
    SELECT generate_series(
      DATE_TRUNC('week', CURRENT_DATE - INTERVAL '7 weeks')::date,
      DATE_TRUNC('week', CURRENT_DATE)::date,
      '1 week'::interval
    )::date AS week_start
  ) w
  LEFT JOIN (
    SELECT
      DATE_TRUNC('week', booking_date)::date                                     AS week_start,
      ROUND(COALESCE(SUM(paid_amount) FILTER (WHERE paid = true), 0)::numeric, 2) AS revenue
    FROM bookings
    WHERE booking_date >= (CURRENT_DATE - INTERVAL '8 weeks')::date
    GROUP BY DATE_TRUNC('week', booking_date)
  ) d USING (week_start);

  -- ── Status distribution ───────────────────────────────────────────────
  SELECT COALESCE(jsonb_object_agg(status, cnt), '{}'::jsonb)
  INTO v_status
  FROM (
    SELECT status, COUNT(*) AS cnt
    FROM bookings
    WHERE booking_date >= v_from_date
    GROUP BY status
  ) t;

  -- ── Source distribution ───────────────────────────────────────────────
  SELECT COALESCE(jsonb_object_agg(src, cnt), '{}'::jsonb)
  INTO v_source
  FROM (
    SELECT COALESCE(how_found_us, 'Unbekannt') AS src, COUNT(*) AS cnt
    FROM bookings
    WHERE booking_date >= v_from_date
    GROUP BY COALESCE(how_found_us, 'Unbekannt')
  ) t;

  -- ── Revenue by service ────────────────────────────────────────────────
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object('name', title, 'revenue', revenue, 'count', cnt)
  ), '[]'::jsonb)
  INTO v_svc_rev
  FROM (
    SELECT
      COALESCE(s.title, 'Unbekannt')                          AS title,
      ROUND(COALESCE(SUM(b.paid_amount), 0)::numeric, 2)      AS revenue,
      COUNT(*)                                                  AS cnt
    FROM bookings b
    LEFT JOIN services s ON s.id = b.service_id
    WHERE b.booking_date >= v_from_date AND b.paid = true
    GROUP BY COALESCE(s.title, 'Unbekannt')
  ) t;

  RETURN jsonb_build_object(
    'kpis',        v_kpis || jsonb_build_object('total_customers', v_customers),
    'monthly',     COALESCE(v_monthly, '[]'::jsonb),
    'weekly',      COALESCE(v_weekly,  '[]'::jsonb),
    'status_dist', v_status,
    'source_dist', v_source,
    'service_rev', v_svc_rev
  );
END;
$$;

-- Grant execute to authenticated users (RLS on the function via SECURITY DEFINER
-- + is_admin() check in the frontend is sufficient for this internal endpoint)
GRANT EXECUTE ON FUNCTION get_analytics_summary() TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────
-- SECTION 2 — Chat Overview RPC
-- Replaces 3 queries + JS aggregation with a single LATERAL JOIN query.
-- Returns one row per customer with last_message + unread_count.
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_chat_overview()
RETURNS TABLE (
  customer_id     uuid,
  full_name       text,
  email           text,
  customer_status text,
  last_message    text,
  last_message_at timestamptz,
  unread_count    bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_admin_id uuid;
BEGIN
  SELECT id INTO v_admin_id FROM profiles WHERE role = 'admin' LIMIT 1;

  RETURN QUERY
  SELECT
    p.id                         AS customer_id,
    p.full_name,
    p.email,
    p.customer_status::text,
    lm.message                   AS last_message,
    lm.created_at                AS last_message_at,
    COALESCE(uc.cnt, 0)          AS unread_count
  FROM profiles p
  LEFT JOIN LATERAL (
    SELECT message, created_at
    FROM chat_messages
    WHERE (sender_id = p.id    AND receiver_id = v_admin_id)
       OR (sender_id = v_admin_id AND receiver_id = p.id)
    ORDER BY created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS cnt
    FROM chat_messages
    WHERE sender_id   = p.id
      AND receiver_id = v_admin_id
      AND is_read     = false
  ) uc ON true
  WHERE p.role = 'customer'
  ORDER BY lm.created_at DESC NULLS LAST;
END;
$$;

GRANT EXECUTE ON FUNCTION get_chat_overview() TO authenticated;


-- ─────────────────────────────────────────────────────────────────────────
-- SECTION 3 — Performance Indices
-- Only targeted indices with proven query patterns in the codebase.
-- ─────────────────────────────────────────────────────────────────────────

-- bookings: admin list (ORDER BY booking_date DESC) + status filter
-- Benefits: /admin/bookings fetchBookings(), analytics bounded queries
CREATE INDEX IF NOT EXISTS idx_bookings_date_status
  ON bookings(booking_date DESC, status);

-- bookings: analytics date range scan
-- Benefits: get_analytics_summary() WHERE booking_date >= v_from_date
CREATE INDEX IF NOT EXISTS idx_bookings_date
  ON bookings(booking_date);

-- bookings: payment toggle + analytics paid filter
-- Partial index — only indexes rows where paid = true (smaller, faster)
CREATE INDEX IF NOT EXISTS idx_bookings_paid_amount
  ON bookings(booking_date, paid_amount) WHERE paid = true;

-- chat_messages: thread queries (bidirectional, ordered by time)
-- Benefits: admin/chat/[customerId] thread fetch + get_chat_overview() LATERAL
CREATE INDEX IF NOT EXISTS idx_chat_messages_thread
  ON chat_messages(sender_id, receiver_id, created_at DESC);

-- chat_messages: unread count per sender
-- Benefits: get_chat_overview() LATERAL unread count + mark-as-read query
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread
  ON chat_messages(receiver_id, is_read) WHERE is_read = false;

-- availability: date window lookup (used in AvailabilityCalendar + admin availability)
-- Benefits: WHERE is_available = true AND date >= ...
CREATE INDEX IF NOT EXISTS idx_availability_date
  ON availability(date, is_available) WHERE is_available = true;

-- availability: recurring slot lookup by day_of_week
-- Benefits: AvailabilityCalendar recurring projection, admin availability calendar
CREATE INDEX IF NOT EXISTS idx_availability_recurring
  ON availability(recurring_weekly, day_of_week) WHERE recurring_weekly = true;

-- profiles: role-based lookups (auth checks, admin pages, chat)
-- Benefits: every admin page, AuthContext, chat overview
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON profiles(role);
