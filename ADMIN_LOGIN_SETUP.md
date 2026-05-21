# Admin Dashboard Login Setup

## What Was Added

1. **Web Dashboard Login Screen** - Before accessing the admin dashboard, users must now authenticate
2. **Admin API Endpoint** - `/api/admin/login` on the server to verify credentials
3. **Admin Database Table** - New `admins` table in Supabase to store admin credentials

## Setup Instructions

### Step 1: Create Admin Table in Supabase

1. Go to https://supabase.com/dashboard
2. Select your project: **bike-rental**
3. Click **SQL Editor** in the sidebar
4. Click **New Query**
5. Copy and paste the contents of `ADMIN_SETUP.sql`:

```sql
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO admins (username, password, name) VALUES 
  ('admin', 'admin123', 'Admin User')
ON CONFLICT (username) DO NOTHING;
```

6. Click **Run** to create the table and insert demo credentials

### Step 2: Test Admin Login

1. Open http://localhost:5173 in your browser
2. You should see the Admin Dashboard login screen
3. Enter credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
4. Click **Sign In**

If successful, you'll be logged in and see the dashboard with the sidebar.

## Demo Credentials

- **Username:** `admin`
- **Password:** `admin123`
- **Name:** Admin User

## Important Notes

⚠️ **Security Warning**: Plain-text passwords are used for simplicity. Before production deployment:
- Implement bcrypt password hashing on the server
- Use environment variables for admin credentials
- Add session/JWT tokens for persistent auth
- Add email verification for account recovery

## File Changes

- **Server** (`server/index.js`):
  - Added `POST /api/admin/login` endpoint
  
- **Dashboard** (`web/src/App.jsx`):
  - Added auth state (adminAuth, authLoading, authError)
  - Added login screen UI
  - Added logout button in sidebar
  - Protected dashboard with authentication check
  - Stores auth token in localStorage

## Usage

After login, the dashboard will:
- Display your name at the top of the sidebar
- Allow access to all admin features (Bikes, Pricing, etc.)
- Show a "Sign Out" button to logout
- Clear localStorage when logging out

## Logout

Click the **Sign Out** button in the sidebar to logout. This will:
- Clear authentication state
- Remove localStorage token
- Redirect to login screen
