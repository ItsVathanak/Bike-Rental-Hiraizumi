-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert demo admin (username: admin, password: admin123)
INSERT INTO admins (username, password, name) VALUES 
  ('admin', 'admin123', 'Admin User')
ON CONFLICT (username) DO NOTHING;

-- Optional: Insert second admin for testing
-- INSERT INTO admins (username, password, name) VALUES 
--   ('manager', 'manager123', 'Manager User')
-- ON CONFLICT (username) DO NOTHING;
