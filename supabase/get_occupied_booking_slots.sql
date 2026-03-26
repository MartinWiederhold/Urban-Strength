-- Öffentlicher Kalender: nur Datum + Uhrzeiten gebuchter Slots (keine Kundendaten).
-- Ausführen in Supabase SQL Editor, damit anonyme Nutzer belegte Zeiten sehen können.

CREATE OR REPLACE FUNCTION public.get_occupied_booking_slots(p_from date, p_to date)
RETURNS TABLE(booking_date date, start_time time without time zone, end_time time without time zone)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.booking_date, b.start_time::time, b.end_time::time
  FROM public.bookings b
  WHERE b.status IN ('booked', 'confirmed', 'completed')
    AND b.booking_date >= p_from
    AND b.booking_date <= p_to;
$$;

REVOKE ALL ON FUNCTION public.get_occupied_booking_slots(date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_occupied_booking_slots(date, date) TO anon, authenticated;
