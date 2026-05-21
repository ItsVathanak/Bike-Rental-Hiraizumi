# Bike Rental App - Deployment Guide

## What's Ready for Deployment

✅ **Mobile App** (React Native/Expo)
- User registration & login
- Bike listing with available/rented status
- Rental confirmation flow
- Active rental tracking
- Return process with photo capture
- **NEW:** User profile screen with logout

✅ **Web Dashboard** (React + Vite)
- Admin login (separate from user login)
- Bike management (add, edit, view)
- Pricing configuration by bike type
- Bike fleet monitoring
- Rental session tracking
- Notification system

✅ **Backend Server** (Express.js)
- User authentication & registration
- Admin authentication
- Bike management API
- Rental session lifecycle
- Notification system

✅ **Database** (Supabase PostgreSQL)
- Users table
- Admins table
- Bikes table
- Rentals table
- Notifications table

---

## Deployment Steps

### Step 1: Push to GitHub

```bash
cd bike-rental-app
git init
git add .
git commit -m "Initial commit: Bike rental app with admin login and user profile"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bike-rental-app.git
git push -u origin main
```

### Step 2: Deploy Mobile App (Expo)

The mobile app is built with Expo and can be:
- **Deployed to Expo Go** for immediate testing
  - Run: `cd mobile-app && npm start`
  - Scan with Expo Go app on your phone

- **Built to APK/iOS**
  - Android: `eas build --platform android --auto-submit`
  - iOS: `eas build --platform ios --auto-submit`
  - Requires EAS Account at https://expo.dev

### Step 3: Deploy Web Dashboard to Vercel

1. **Connect GitHub repo to Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select root directory: `web`

2. **Environment Variables:**
   - Add `VITE_API_BASE=https://YOUR_BACKEND_URL`

3. **Deploy:**
   - Vercel auto-deploys on push to main

### Step 4: Deploy Backend Server

**Option A: Railway (Recommended)**
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Set working directory: `server`
5. Add environment variables:
   ```
   SUPABASE_URL=https://okynwmzzodvxeeputbvn.supabase.co
   SUPABASE_ANON_KEY=sb_publishable_hKZ4hTdQY8dK4Bi3x8R_9Q_cfYzYJ1L
   PORT=8787
   ```
6. Deploy!

**Option B: Heroku**
1. Install Heroku CLI
2. `heroku login`
3. `heroku create YOUR_APP_NAME`
4. `git push heroku main`

**Option C: Your own VPS**
1. SSH into your server
2. Clone the repo
3. Install Node.js
4. `npm install` and `npm start`

### Step 5: Update Mobile App API URL

Once backend is deployed, update the API URL:
- File: `mobile-app/App.js`
- Line 11: `const API_BASE_URL = 'https://YOUR_BACKEND_URL/api'`

Then rebuild and deploy the mobile app.

### Step 6: Update Web Dashboard API URL

Once backend is deployed, update the API URL:
- File: `web/src/App.jsx`
- Line 3: `const API_BASE = import.meta.env.VITE_API_BASE || "https://YOUR_BACKEND_URL"`

Vercel will auto-redeploy when you push changes.

---

## Testing Checklist Before Going Live

### Admin Dashboard
- [ ] Admin login works (username: admin, password: admin123)
- [ ] Can view notifications
- [ ] Can select and view bike details
- [ ] Can add new bikes
- [ ] Can update pricing by bike type
- [ ] Can view all bikes in fleet
- [ ] Can view rental sessions
- [ ] Sign out button works

### Mobile App (iOS/Android)
- [ ] Can register new account
- [ ] Can login with existing account
- [ ] Can view available bikes
- [ ] Can see active rental banner if rental exists
- [ ] Rent button disabled if active rental exists
- [ ] Profile button opens profile screen
- [ ] Profile displays correct user info
- [ ] Sign out from profile screen works
- [ ] Can complete rental flow
- [ ] Can start return process
- [ ] Can take photo during return
- [ ] Lockbox code displays correctly

### Data Flow
- [ ] Admin can add bike → appears in mobile app
- [ ] User rents bike → shows in admin dashboard
- [ ] Bike status updates from available to in-use
- [ ] User returns bike → status updates back to available
- [ ] Notifications appear when expected

---

## Production Checklist

Before deploying to production, complete:

- [ ] Change admin password from "admin123" to something secure
- [ ] Enable SSL/HTTPS on all endpoints
- [ ] Set up error logging (Sentry, LogRocket, etc.)
- [ ] Enable rate limiting on APIs
- [ ] Add bcrypt password hashing (currently plain text)
- [ ] Configure CORS properly for production domains
- [ ] Set up database backups
- [ ] Add monitoring & alerting
- [ ] Test on multiple devices/browsers
- [ ] Set up CDN for images/assets
- [ ] Create user documentation
- [ ] Set up support/help system

---

## After Deployment

### URLs
- **Admin Dashboard:** `https://YOUR_DOMAIN/admin` (or Vercel URL)
- **Mobile App:** Available on Expo/App Store/Play Store
- **Backend API:** `https://YOUR_BACKEND_URL/api`

### Accessing Services
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Admin First Login:**
  - Username: admin
  - Password: admin123
  - ⚠️ Change this immediately!

### Support
- Check logs on Vercel & Railway/Heroku
- Monitor Supabase database
- Set up alerts for errors

---

## Quick Reference

**User Credentials (Demo)**
- Username: johnnexon / user1 / user2
- Password: password (for all demo users)

**Admin Credentials (Demo)**
- Username: admin
- Password: admin123

**API Endpoints**
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/admin/login` - Admin login
- `GET /api/bikes` - List all bikes
- `POST /api/bikes` - Add new bike
- `GET /api/rentals` - List all rentals
- See server code for complete API reference

---

## Troubleshooting

**Mobile app won't connect to backend:**
- Check API_BASE_URL in App.js
- Verify backend is running
- Check CORS settings

**Admin dashboard login fails:**
- Verify admin table exists in Supabase
- Check Supabase credentials in server .env
- Look for errors in browser console

**Bikes don't appear in mobile app:**
- Check if bikes were added to database
- Verify API endpoint is accessible
- Look for network errors in mobile app logs

**Vercel deployment fails:**
- Check build logs in Vercel dashboard
- Ensure `npm run build` works locally
- Verify environment variables are set

---

Good luck! 🚀
