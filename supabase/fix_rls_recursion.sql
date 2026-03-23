-- =============================================
-- Migration: Fix RLS infinite recursion on profiles
-- Führe dieses Script im Supabase SQL Editor aus.
-- =============================================

-- Schritt 1: Rekursive Admin-Policies entfernen
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin full access bookings" ON bookings;
DROP POLICY IF EXISTS "Admin manages availability" ON availability;
DROP POLICY IF EXISTS "Admin full access plans" ON training_plans;
DROP POLICY IF EXISTS "Admin manages services" ON services;

-- Schritt 2: SECURITY DEFINER Funktion erstellen
-- Diese Funktion läuft als Datenbankbesitzer (bypassed RLS),
-- wodurch keine Rekursion entstehen kann.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Schritt 3: Policies mit is_admin() neu erstellen
CREATE POLICY "Admin can view all profiles"  ON profiles  FOR SELECT USING (is_admin());
CREATE POLICY "Admin can manage all profiles" ON profiles FOR ALL    USING (is_admin());
CREATE POLICY "Admin full access bookings"   ON bookings  FOR ALL    USING (is_admin());
CREATE POLICY "Admin manages availability"   ON availability FOR ALL USING (is_admin());
CREATE POLICY "Admin full access plans"      ON training_plans FOR ALL USING (is_admin());
CREATE POLICY "Admin manages services"       ON services  FOR ALL    USING (is_admin());
