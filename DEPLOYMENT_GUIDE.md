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

### Step 4: Deploy Backend Server to Vercel

**Why Vercel for Backend?**
- Permanently free tier (no limitations)
- Automatic deployments on GitHub push
- Built-in environment variables management
- Node.js serverless functions support
- Same dashboard as web frontend

**Steps:**

1. **Create `vercel.json` in `server/` folder** (if not already created):
   ```json
   {
     "buildCommand": "npm install",
     "functions": {
       "api/**/*.js": {
         "memory": 1024,
         "maxDuration": 30
       }
     }
   }
   ```

2. **Ensure `server/package.json` has proper scripts:**
   ```json
   {
     "scripts": {
       "start": "node index.js",
       "dev": "node index.js"
     }
   }
   ```

3. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Set **Root Directory** to `server`

4. **Add Environment Variables:**
   - `SUPABASE_URL=https://okynwmzzodvxeeputbvn.supabase.co`
   - `SUPABASE_ANON_KEY=sb_publishable_hKZ4hTdQY8dK4Bi3x8R_9Q_cfYzYJ1L`

5. **Click Deploy!**
   - Vercel will build and deploy automatically
   - You'll get a URL like: `https://your-project.vercel.app`
   - **Copy this URL** - you'll need it next

### Step 5: Update Web Dashboard with Backend URL

Once backend is deployed on Vercel:

1. **Get your backend URL** from Vercel dashboard (e.g., `https://bike-backend.vercel.app`)

2. **Go to your Web Dashboard Vercel project:**
   - Click "Settings"
   - Click "Environment Variables"

3. **Update `VITE_API_BASE` variable:**
   - Name: `VITE_API_BASE`
   - Value: `https://your-backend-url.vercel.app/api`
   - (Replace with actual backend URL)

4. **Trigger a redeploy:**
   - Go to "Deployments"
   - Click the latest deployment
   - Click "..." menu → "Redeploy"
   - Wait for redeployment (2-3 minutes)

### Step 6: Update Mobile App API URL

Once backend is deployed, update the mobile app:

1. **Edit:** `mobile-app/App.js` (Line 11)
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.vercel.app/api'
   ```

2. **Rebuild mobile app:**
   - If using Expo: `cd mobile-app && npm start` and scan QR code
   - If using EAS: `eas build --platform android`

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

## Summary: All Components Deployed on Vercel (Free)

✅ **Web Dashboard** - Vercel (Free)
✅ **Backend Server** - Vercel (Free)  
✅ **Mobile App** - Expo (Free)
✅ **Database** - Supabase (Free tier)

**No monthly costs!** Everything is on permanently free tiers.

---

## Vercel Backend Details

Your Express backend runs on Vercel as serverless functions. The current `server/index.js` works as-is with minimal changes:

- Vercel automatically wraps Express into serverless functions
- All routes remain the same (`/api/login`, `/api/bikes`, etc.)
- No need to convert individual routes
- Simply push to GitHub and Vercel deploys automatically

For more details, see **VERCEL_DEPLOYMENT.md** in this folder.

---

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
