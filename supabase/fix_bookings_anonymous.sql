-- =============================================
-- FIX: Anonyme Buchungen ohne Login ermöglichen
-- Führe dieses Script im Supabase SQL Editor aus.
-- Es ist vollständig idempotent (mehrfach ausführbar).
-- =============================================

-- 1. customer_id darf NULL sein (anonyme Buchungen)
ALTER TABLE bookings ALTER COLUMN customer_id DROP NOT NULL;

-- 2. Fehlende Spalten hinzufügen
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS first_name       TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_name        TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email   TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone   TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid             BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_amount      DECIMAL(10,2) NOT NULL DEFAULT 0;

-- 3. recurring_end_date auf availability (falls fehlt)
ALTER TABLE availability ADD COLUMN IF NOT EXISTS recurring_end_date DATE;

-- 4. Alte blockierende INSERT-Policy entfernen
DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;

-- 5. Neue Policy: Jeder (auch anonym) darf buchen
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'bookings' AND policyname = 'Anyone can create bookings'
  ) THEN
    CREATE POLICY "Anyone can create bookings" ON bookings
      FOR INSERT WITH CHECK (true);
  END IF;
END$$;

-- 6. Sicherstellen dass RLS auf bookings aktiv ist
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Fertig. Teste jetzt eine anonyme Buchung auf der Website.
