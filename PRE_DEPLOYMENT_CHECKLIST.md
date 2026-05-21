# ✅ Pre-Deployment Checklist

Before pushing to Vercel, make sure everything below is ready:

## Code Readiness

- [ ] **Git repo exists** and has all code committed
  - Run: `git status` - should show "working tree clean"
  
- [ ] **Backend export is working**
  - Check: `server/index.js` line 705+ has `export default app`
  - This is what Vercel needs to run your backend

- [ ] **vercel.json exists** in `server/` folder
  - Configured for Express app
  - No changes needed

- [ ] **package.json has start script**
  - Check: `server/package.json` has `"start": "node index.js"`

## Environment Variables Ready

**For Vercel backend project:**
- [ ] `SUPABASE_URL` = `https://okynwmzzodvxeeputbvn.supabase.co`
- [ ] `SUPABASE_ANON_KEY` = `sb_publishable_hKZ4hTdQY8dK4Bi3x8R_9Q_cfYzYJ1L`

**For Vercel web project:**
- [ ] `VITE_API_BASE` = `https://your-backend-url.vercel.app`
  - (Set this AFTER backend is deployed)

## Database Setup

- [ ] Supabase tables exist:
  - [ ] `users` table
  - [ ] `bikes` table
  - [ ] `rentals` table
  - [ ] `admins` table
  - [ ] `notifications` table

- [ ] Sample data exists:
  - [ ] At least 2 bikes in `bikes` table
  - [ ] Admin user in `admins` table (admin/admin123)
  - [ ] At least 1 user in `users` table

## Local Testing (Optional but Recommended)

- [ ] Backend works locally:
  ```bash
  cd server
  npm start
  # Should print: Server running on http://localhost:8787
  ```

- [ ] Backend responds to requests:
  ```bash
  curl http://localhost:8787/api/bikes
  # Should return JSON list of bikes
  ```

- [ ] Web dashboard works locally:
  ```bash
  cd web
  npm start
  # Should open at http://localhost:5173
  ```

- [ ] Mobile app works locally:
  ```bash
  cd mobile-app
  npm start
  # Should show Expo QR code
  ```

## GitHub Readiness

- [ ] All files committed:
  ```bash
  git add .
  git commit -m "Prepare for Vercel deployment"
  git push
  ```

- [ ] GitHub repo is public (or Vercel has access)

- [ ] `.gitignore` is set up correctly:
  - Excludes `node_modules/`
  - Excludes `.env` (DO NOT commit secrets!)

## Documentation Complete

- [ ] `README.md` - Project overview
- [ ] `QUICK_START.md` - User guide
- [ ] `DEPLOYMENT_GUIDE.md` - Deployment steps
- [ ] `ADMIN_LOGIN_SETUP.md` - Admin setup
- [ ] `VERCEL_QUICK_START.md` - Vercel 3-step guide
- [ ] `VERCEL_DEPLOYMENT.md` - Detailed Vercel guide

## Vercel Account Readiness

- [ ] Vercel account created at https://vercel.com
- [ ] GitHub connected to Vercel account
- [ ] Able to create new projects

## Deployment Sequence

**Phase 1: Backend Deployment**
1. [ ] Create Vercel project for backend (root: `server/`)
2. [ ] Add environment variables to backend project
3. [ ] Deploy
4. [ ] Copy backend URL (e.g., `https://bike-backend.vercel.app`)
5. [ ] Test: `curl https://bike-backend.vercel.app/api/bikes`

**Phase 2: Web Dashboard Deployment**
1. [ ] Create Vercel project for web (root: `web/`)
2. [ ] Add `VITE_API_BASE` env variable with backend URL
3. [ ] Deploy
4. [ ] Test: Open URL and login as admin

**Phase 3: Mobile App Update**
1. [ ] Update `mobile-app/App.js` line 11 with backend URL
2. [ ] Test: `cd mobile-app && npm start`
3. [ ] Scan QR code and test login, bike rental

## Final Verification

After all deployments:

- [ ] Web dashboard loads without errors
- [ ] Admin login works (admin / admin123)
- [ ] Can see bikes list
- [ ] Backend URL is accessible
- [ ] Mobile app connects to backend
- [ ] Can register new user on mobile
- [ ] Can login on mobile
- [ ] Can see bikes on mobile
- [ ] Can rent a bike
- [ ] User appears in admin dashboard
- [ ] Bike status changes in admin dashboard

## Post-Deployment Tasks

- [ ] Share URLs with your client M
- [ ] Provide demo credentials
- [ ] Monitor logs for errors
- [ ] Test from different devices
- [ ] Set up error monitoring (optional: Sentry)

---

## 🚀 Ready to Deploy?

If all checkboxes above are checked:

✅ **You're ready! Follow VERCEL_QUICK_START.md to deploy**

Not ready? Double-check the unchecked items above.

---

## Quick Command Reference

```bash
# Check git status
git status

# Push code to GitHub
git add .
git commit -m "Your message"
git push

# Test backend locally
cd server && npm start

# Test web locally
cd web && npm start

# Test mobile locally
cd mobile-app && npm start
```

---

Good luck! You've got this! 🎉
