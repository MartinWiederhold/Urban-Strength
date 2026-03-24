-- Make customer_id optional (anonymous bookings)
ALTER TABLE bookings ALTER COLUMN customer_id DROP NOT NULL;

-- Add direct booking fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Update RLS to allow anonymous inserts
DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
