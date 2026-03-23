-- Migration: Add payment tracking fields to bookings table
-- Run this in the Supabase SQL editor

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS paid BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Index for analytics queries on paid status
CREATE INDEX IF NOT EXISTS idx_bookings_paid ON bookings(paid);

-- Comments
COMMENT ON COLUMN bookings.paid IS 'Whether the booking has been paid (marked by admin)';
COMMENT ON COLUMN bookings.paid_amount IS 'Amount paid in CHF (CHF 35/h rate, 0 for free probe training)';
