# 🚀 Vercel Deployment - Quick Start Guide

**Everything is ready! Follow these 3 simple steps to deploy your entire app for free.**

---

## Step 1: Push Code to GitHub

```bash
cd bike-rental-app
git add .
git commit -m "Prepare for Vercel deployment: add vercel.json and export app"
git push
```

✅ All files are ready:
- `vercel.json` ✓
- `server/package.json` with `start` script ✓
- `server/index.js` exports for Vercel ✓
- `.env` configured ✓

---

## Step 2: Deploy Backend to Vercel

### 2a. Create Vercel Project for Backend

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `bike-rental-app` repo
5. Click **"Import"**

### 2b. Configure Root Directory

When asked for **"Root Directory"**:
- Click the folder dropdown
- Select **`server`**
- Click **"Continue"**

### 2c. Add Environment Variables

1. Scroll to **"Environment Variables"** section
2. Add two variables:

   **Variable 1:**
   - Key: `SUPABASE_URL`
   - Value: `https://okynwmzzodvxeeputbvn.supabase.co`

   **Variable 2:**
   - Key: `SUPABASE_ANON_KEY`
   - Value: `sb_publishable_hKZ4hTdQY8dK4Bi3x8R_9Q_cfYzYJ1L`

3. Click **"Deploy"**

### 2d. Wait for Deployment

Vercel will:
- Install dependencies
- Build and deploy
- Provide you with a URL like: `https://your-project.vercel.app`

**Copy this URL!** You'll need it next.

---

## Step 3: Deploy Web Dashboard to Vercel

### 3a. Create Another Vercel Project for Web

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `bike-rental-app` repo (same repo!)
5. Click **"Import"**

### 3b. Configure Root Directory

When asked for **"Root Directory"**:
- Click the folder dropdown
- Select **`web`**
- Click **"Continue"**

### 3c. Add Environment Variables

1. Scroll to **"Environment Variables"**
2. Add one variable:

   **Variable:**
   - Key: `VITE_API_BASE`
   - Value: `https://your-backend-url.vercel.app`
   
   (Use the backend URL from Step 2d)

3. Click **"Deploy"**

---

## Step 4: Update Mobile App

Once both are deployed, update the mobile app:

**File:** `mobile-app/App.js` (Line 11)

```javascript
// OLD:
const API_BASE_URL = 'http://192.168.0.123:8787/api'

// NEW:
const API_BASE_URL = 'https://your-backend-url.vercel.app/api'
```

Rebuild and test:
```bash
cd mobile-app
npm start
# Scan QR code with Expo Go
```

---

## ✅ You're Done!

Your app is now live:

- **Web Dashboard:** `https://your-web-project.vercel.app`
- **Backend API:** `https://your-backend-url.vercel.app/api`
- **Mobile App:** Running on your phone via Expo

---

## Testing

### Test Web Dashboard
1. Go to your web dashboard URL
2. Login with: `admin` / `admin123`
3. Try adding a bike, viewing rentals, etc.

### Test Backend API
```bash
# Get all bikes
curl https://your-backend-url.vercel.app/api/bikes

# User login
curl -X POST https://your-backend-url.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"johnnexon","password":"password"}'
```

### Test Mobile App
- Register new account
- Login and rent a bike
- Return bike and check dashboard

---

## 💡 Tips

- **Auto-deploy:** Every time you push to `main`, both projects redeploy automatically
- **Multiple projects from same repo:** You created 2 Vercel projects from 1 GitHub repo (one for `web/`, one for `server/`)
- **Free forever:** This setup costs $0/month (Vercel free tier + Supabase free tier)
- **No Railway/Heroku needed:** Everything is on Vercel now

---

## 🚨 If Something Goes Wrong

### Backend not responding (404 error)
- Check Vercel backend project logs: Dashboard → Backend → Deployments → Logs
- Verify environment variables are set correctly
- Make sure you're using `/api/` prefix in requests

### Web dashboard can't connect to backend
- Check `VITE_API_BASE` environment variable
- Open browser console (F12) and look for network errors
- Make sure backend URL doesn't have trailing slash

### Mobile app shows network error
- Verify `API_BASE_URL` in `mobile-app/App.js`
- Test backend URL directly: `curl https://your-url.vercel.app/api/bikes`
- Rebuild mobile app after changing URL

### "Cannot find module" error during build
- Run `npm install` in affected folder
- Check package.json for typos
- Redeploy from Vercel dashboard

---

## Next Steps

After going live:

1. ✅ Tell your users to start renting bikes!
2. ✅ Monitor logs in Vercel dashboard
3. ✅ Update bike prices and manage fleet in admin dashboard
4. ✅ Watch rental analytics

For more detailed info, see **DEPLOYMENT_GUIDE.md** or **VERCEL_DEPLOYMENT.md**

Good luck! 🎉
