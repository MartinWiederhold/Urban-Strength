-- =============================================
-- FIX: Admin RLS – verhindert infinite recursion auf profiles
-- Führe dieses Script im Supabase SQL Editor aus.
-- Danach laden Admin-Seiten (Buchungen, Kunden) korrekt.
-- =============================================

-- 1. Rekursive Policies entfernen (falls noch vorhanden)
DROP POLICY IF EXISTS "Admin can view all profiles"    ON profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles"  ON profiles;
DROP POLICY IF EXISTS "Admin full access bookings"     ON bookings;
DROP POLICY IF EXISTS "Admin manages availability"     ON availability;
DROP POLICY IF EXISTS "Admin full access plans"        ON training_plans;
DROP POLICY IF EXISTS "Admin manages services"         ON services;

-- 2. SECURITY DEFINER Funktion – läuft ohne RLS, keine Rekursion möglich
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Admin-Policies mit is_admin() neu erstellen
CREATE POLICY "Admin can view all profiles"   ON profiles   FOR SELECT USING (is_admin());
CREATE POLICY "Admin can manage all profiles" ON profiles   FOR ALL    USING (is_admin());
CREATE POLICY "Admin full access bookings"    ON bookings   FOR ALL    USING (is_admin());
CREATE POLICY "Admin manages availability"    ON availability FOR ALL  USING (is_admin());
CREATE POLICY "Admin manages services"        ON services   FOR ALL    USING (is_admin());

-- 4. Eigenes Profil lesen/schreiben (für normale Nutzer)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Fertig. Admin-Dashboard sollte jetzt Daten laden.
