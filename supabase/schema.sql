-- =============================================
-- Personal Training Zurich – Datenbankschema
-- =============================================

-- Tabelle: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  notes TEXT,
  customer_status TEXT DEFAULT 'new' CHECK (customer_status IN ('new', 'active', 'inactive', 'vip')),
  customer_tags TEXT[],
  fitness_goals TEXT,
  health_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle: services
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_minutes INT NOT NULL DEFAULT 60,
  features TEXT[],
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle: availability
CREATE TABLE IF NOT EXISTS availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  recurring_weekly BOOLEAN DEFAULT false,
  day_of_week INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle: bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  availability_id UUID REFERENCES availability(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'rescheduled', 'no_show')),
  age INT,
  gender TEXT,
  fitness_level TEXT,
  goals TEXT,
  health_conditions TEXT,
  how_found_us TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle: chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle: training_plans
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('training', 'nutrition', 'general')),
  content JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabelle: admin_online_status
CREATE TABLE IF NOT EXISTS admin_online_status (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = 'customer');
CREATE POLICY "Admin can view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can manage all profiles" ON profiles FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Allow insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Bookings RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers see own bookings" ON bookings FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Customers can create bookings" ON bookings FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customers can update own bookings" ON bookings FOR UPDATE USING (customer_id = auth.uid());
CREATE POLICY "Admin full access bookings" ON bookings FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Chat RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat participants can view" ON chat_messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can send messages" ON chat_messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Mark as read" ON chat_messages FOR UPDATE USING (receiver_id = auth.uid());

-- Availability RLS
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view availability" ON availability FOR SELECT USING (true);
CREATE POLICY "Admin manages availability" ON availability FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Training Plans RLS
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers see own plans" ON training_plans FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Admin full access plans" ON training_plans FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Services RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view services" ON services FOR SELECT USING (true);
CREATE POLICY "Admin manages services" ON services FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Admin Online Status RLS
ALTER TABLE admin_online_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view admin status" ON admin_online_status FOR SELECT USING (true);
CREATE POLICY "Admin manages own status" ON admin_online_status FOR ALL USING (auth.uid() = id);

-- =============================================
-- TRIGGER: Updated At
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON training_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- SEED DATA: Services
-- =============================================
INSERT INTO services (title, description, price, duration_minutes, features, is_active, sort_order) VALUES
(
  'Kostenloser Start – Geräte-Einweisung & Probetraining',
  'Dein erster Termin ist komplett gratis. Lerne das Gym kennen, lerne mich kennen, und starte mit deinem ersten Training.',
  0,
  60,
  ARRAY[
    'Einführung in die wichtigsten Geräte',
    'Korrekte Übungsausführung (Verletzungen vermeiden)',
    'Individuelle Beratung zu deinen Zielen',
    'Erste Trainingseinheit mit Anleitung',
    'Tipps für einen sicheren Start'
  ],
  true,
  1
),
(
  'Personal Training 1:1',
  'Individuelles Training, das auf dich zugeschnitten ist. Maximale Resultate durch persönliche Betreuung.',
  35,
  60,
  ARRAY[
    'Individuell auf dich abgestimmtes Training',
    'Persönliche Betreuung (keine Fehler, maximale Effizienz)',
    'Motivation & Push im Training',
    'Fortschritts-Tracking',
    'Anpassung deines Trainingsplans',
    'Optional: Ernährungstipps & Trainingsplan für zuhause'
  ],
  true,
  2
)
ON CONFLICT DO NOTHING;
