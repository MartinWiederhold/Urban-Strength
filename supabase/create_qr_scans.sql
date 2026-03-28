-- QR code scan tracking table for analytics
CREATE TABLE IF NOT EXISTS qr_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  country TEXT,
  city TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS (admin-only reads, anonymous inserts via anon key)
ALTER TABLE qr_scans DISABLE ROW LEVEL SECURITY;

-- Indices for analytics queries
CREATE INDEX IF NOT EXISTS idx_qr_scans_created_at ON qr_scans(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_scans_visitor_id ON qr_scans(visitor_id);
