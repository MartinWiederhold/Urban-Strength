-- =========================================================================
-- FIX: Öffentliches Buchungssystem – RLS Policies für anonyme Nutzer
-- Sichert: Kalender laden, Termine sehen, Buchung absenden ohne Login.
-- IDEMPOTENT — kann mehrfach ausgeführt werden.
--
-- Ausführen: Supabase Dashboard → SQL Editor → New Query → Run
-- =========================================================================


-- ─────────────────────────────────────────────────────────────────────────
-- 1. AVAILABILITY — Jeder darf verfügbare Termine lesen
--    (Kalender auf /book lädt sonst für anonyme Nutzer leer)
-- ─────────────────────────────────────────────────────────────────────────

-- Entferne die Policy falls sie bereits existiert (sauber neu erstellen)
DROP POLICY IF EXISTS "Anyone can view availability" ON availability;

-- Erstelle sie neu — USING (true) = kein Zugriffslimit für SELECT
CREATE POLICY "Anyone can view availability"
  ON availability
  FOR SELECT
  USING (true);


-- ─────────────────────────────────────────────────────────────────────────
-- 2. SERVICES — Jeder darf aktive Angebote lesen
--    (Sidebar auf /book zeigt Preis/Dauer nur wenn services lesbar)
-- ─────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can view services" ON services;

CREATE POLICY "Anyone can view services"
  ON services
  FOR SELECT
  USING (true);


-- ─────────────────────────────────────────────────────────────────────────
-- 3. BOOKINGS — Anonyme INSERT-Policy
--    (Schema-Standard erlaubt nur customer_id = auth.uid() → bricht für
--     nicht-eingeloggte Nutzer. Fix: Jeder darf buchen)
-- ─────────────────────────────────────────────────────────────────────────

-- Entferne die alte, blockierende Policy
DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create bookings"    ON bookings;

-- Neue Policy: Jeder (auch anonym) darf INSERT
CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────
-- 4. BOOKINGS — Schema-Anpassungen für anonyme Buchungen
--    (customer_id darf NULL sein, extra Spalten für Name/Email/Telefon)
-- ─────────────────────────────────────────────────────────────────────────

-- customer_id erlaubt NULL (anonyme Buchung ohne Konto)
ALTER TABLE bookings ALTER COLUMN customer_id DROP NOT NULL;

-- Spalten für Gast-Buchungsformular (werden ignoriert falls bereits vorhanden)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS first_name      TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_name       TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email  TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone  TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid            BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_amount     DECIMAL(10,2) NOT NULL DEFAULT 0;


-- ─────────────────────────────────────────────────────────────────────────
-- 5. AVAILABILITY — recurring_end_date Spalte (falls noch nicht vorhanden)
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE availability ADD COLUMN IF NOT EXISTS recurring_end_date DATE;


-- ─────────────────────────────────────────────────────────────────────────
-- 6. RLS aktiv sicherstellen
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE services     ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────────
-- FERTIG.
-- Nach Ausführung:
--   ✓ Kalender auf /book zeigt freie Termine
--   ✓ Buchungsformular kann ohne Login abgeschickt werden
--   ✓ Services-Sidebar zeigt Preis und Dauer
-- ─────────────────────────────────────────────────────────────────────────
