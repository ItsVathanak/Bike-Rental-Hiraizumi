# Directory Structure - Ready for GitHub

## What to Push to GitHub

Only push the `bike-rental-app` folder. Here's the clean structure:

```
bike-rental-app/
├── .gitignore                 # Ignore node_modules, .env, etc
├── README.md                  # Project overview & features
├── DEPLOYMENT_GUIDE.md        # Complete deployment instructions
├── QUICK_START.md             # User & admin quick start
├── ADMIN_LOGIN_SETUP.md       # Admin dashboard setup
├── ADMIN_SETUP.sql            # SQL to create admin table
│
├── mobile-app/                # React Native/Expo app
│   ├── App.js                # All screens (login, bikes, rental, profile, etc)
│   ├── app.json              # Expo configuration
│   ├── package.json
│   └── node_modules/         # (gitignored)
│
├── web/                       # React + Vite admin dashboard
│   ├── src/
│   │   ├── App.jsx           # Admin dashboard with sidebar
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── node_modules/         # (gitignored)
│
└── server/                    # Express.js backend
    ├── index.js              # All API endpoints
    ├── package.json
    ├── .env                  # (gitignored - user provides their own)
    └── node_modules/         # (gitignored)
```

## What NOT to Push

❌ `bike-rental-demo/` - Old demo folder (leave at project_folder level)
❌ `bike-rental-demo-lockbox/` - Old lockbox demo (leave at project_folder level)
❌ `node_modules/` - Will be in .gitignore
❌ `.env` files - Will be in .gitignore (users provide their own)

## GitHub Workflow

### First Time Push:

```bash
cd c:\Users\USER\Desktop\Hiraizumi\project_folder\bike-rental-app

# Initialize git
git init
git add .
git commit -m "Initial commit: Bike rental app with admin login and user profile"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bike-rental-app.git
git push -u origin main
```

### Future Pushes:

```bash
cd c:\Users\USER\Desktop\Hiraizumi\project_folder\bike-rental-app
git add .
git commit -m "Your feature description"
git push
```

## Files Included in Repo

✅ README.md - Project overview
✅ DEPLOYMENT_GUIDE.md - How to deploy
✅ QUICK_START.md - How to use the app
✅ ADMIN_LOGIN_SETUP.md - Admin setup
✅ ADMIN_SETUP.sql - SQL for admin table
✅ .gitignore - What not to track
✅ mobile-app/ - Complete React Native app
✅ web/ - Complete React dashboard
✅ server/ - Complete Express backend

## What Users Need to Do After Cloning

1. Install dependencies:
   ```bash
   cd server && npm install
   cd ../web && npm install
   cd ../mobile-app && npm install
   ```

2. Create `.env` file in server/:
   ```
   SUPABASE_URL=your_url
   SUPABASE_ANON_KEY=your_key
   PORT=8787
   ```

3. Follow DEPLOYMENT_GUIDE.md for deployment

4. Follow QUICK_START.md for usage

That's it! Everything is self-contained in bike-rental-app/ 🚀
