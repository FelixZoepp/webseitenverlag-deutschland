ALTER TABLE customers ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';
CREATE INDEX IF NOT EXISTS idx_customers_role ON customers(role);

-- Admin-RLS: Admins sehen alle Submissions
CREATE POLICY "Admins can view all submissions" ON form_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Admin-RLS: Admins sehen alle Sites
CREATE POLICY "Admins can view all sites" ON sites
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update all sites" ON sites
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can insert any site" ON sites
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Admin-RLS: Admins sehen alle Kunden
CREATE POLICY "Admins can view all customers" ON customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can update all customers" ON customers
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Admins can insert customers" ON customers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin')
  );