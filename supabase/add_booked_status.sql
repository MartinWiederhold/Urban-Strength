-- =========================================================================
-- ADD: Neuer Buchungsstatus "booked" (Gebucht)
--
-- Workflow:
--   1. Kunde bucht → Status "booked" (Anfrage eingegangen)
--   2. Admin bestätigt → Status "confirmed" (Termin fix, Kunde erhält Mail)
--
-- IDEMPOTENT — kann mehrfach ausgeführt werden.
-- Ausführen: Supabase Dashboard → SQL Editor → New Query → Run
-- =========================================================================

-- 1. Bestehende CHECK-Constraint entfernen (enthält noch nicht "booked")
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- 2. Neue CHECK-Constraint mit "booked" als erstem Wert
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('booked', 'confirmed', 'cancelled', 'completed', 'rescheduled', 'no_show'));

-- 3. Standard-Wert auf "booked" setzen
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'booked';

-- =========================================================================
-- OPTIONAL: Bestehende "confirmed" Buchungen auf "booked" zurücksetzen
-- Nur ausführen wenn gewünscht – kommentiere die Zeile ein:
-- UPDATE bookings SET status = 'booked' WHERE status = 'confirmed';
-- =========================================================================

-- Nach Ausführung:
--   ✓ Neue Buchungen erhalten Status "booked"
--   ✓ Admin kann zu "confirmed" wechseln → Kunde erhält Bestätigungsmail
-- =========================================================================
