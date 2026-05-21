# Bike Rental App - Quick Start Guide

## For Users (Mobile App)

### First Time Setup
1. Download and install the app from Expo / App Store / Play Store
2. Tap **"Create New Account"**
3. Fill in:
   - Full Name (your name)
   - Email (for future communications)
   - User ID (your username)
   - Password
4. Tap **"Register"**

### Renting a Bike
1. Open the app and log in
2. You'll see **"Available Bikes"** screen
3. Tap the **green "Rent" button** on any bike
4. Review bike details and confirm
5. You'll get the **lockbox code** for the payment box
6. **Go pay at the physical payment box** (cash only)
7. Return to app and confirm payment
8. Bike is yours! Start your rental

### During Rental
- Your **Active Rental banner** shows which bike you have
- Tap **"Continue Rental"** to see rental details
- You can return to **"Available Bikes"** and browse, but **can't rent another bike**

### Returning a Bike
1. Tap **"Start Return"** on your active rental
2. Lock the bike back to the rack
3. Tap **"Lock Bike"** to confirm
4. Take a **photo of the bike and rack** as proof
5. Get the **lockbox code** for the key return
6. Go **return the key** to the lockbox
7. Return to app and confirm
8. Done! Rental is complete

### Your Profile
- Tap **"Profile"** button (top right) from bike list
- See your name, user ID, and email
- Tap **"Sign Out"** to logout
- You'll need to login again to rent bikes

---

## For Admins (Web Dashboard)

### First Time Login
1. Open https://YOUR_DOMAIN (Vercel URL)
2. Enter credentials:
   - Username: **admin**
   - Password: **admin123**
   - ⚠️ **Change this immediately after first login!**

### Dashboard Sections

#### Notifications
- See real-time alerts from the app
- Examples: "User john rented Bike 1", "Payment received"

#### Bikes
- **Select Bike:** Choose a bike from dropdown
- **Bike Details:** View name, ID, status, lockbox code
- **Add/Edit Bike:** Create new bikes or update existing ones
  - ID: unique identifier (e.g., bike-1)
  - Name: display name (e.g., "Station A - Slot 1")
  - Station: location (e.g., "Station A")
  - Lockbox Code: 4-digit code for key storage
  - Bike Type: Electric or Non-Electric

#### Pricing
- Set rental prices for each bike type
- Electric bikes: set your rate (¥)
- Non-Electric bikes: set your rate (¥)
- Click **"Save Prices"** to apply

#### Bike Fleet
- See **all bikes** in a table view
- Edit lockbox codes if needed
- Remove bikes (only if available - not in use)
- Check real-time status (available/in-use)

#### Rental Sessions
- View **all user rentals**
- See who rented what and when
- Track rental status (active/returned/pending-return)
- See start/end times

### Managing Bikes

**Adding a New Bike:**
1. Go to **Bikes** section
2. In "Add/Edit Bike" form, fill:
   - ID: `bike-4` (or next available)
   - Name: `Station C - Slot 3`
   - Station: `Station C`
   - Lockbox Code: `4567`
   - Type: `Electric` or `Non-Electric`
3. Click **"Add Bike"**
4. It appears in fleet immediately

**Editing a Bike's Lockbox Code:**
1. Go to **Bike Fleet** section
2. Find the bike in the table
3. Click **"Edit"** in the Actions column
4. Update the code
5. Click **"Save"**

### Monitoring Rentals

1. Go to **Rental Sessions**
2. Look for **"active"** status rentals (in progress)
3. Click on any rental to see details:
   - Which user has the bike
   - When they rented it
   - Current status

### Logging Out
- Click **"Sign Out"** in the top-left sidebar
- You'll be logged out and returned to login screen

---

## Common Tasks

### I need to change a bike's lockbox code
1. Go to **Bikes** → **Bike Fleet**
2. Find the bike, click **Edit**
3. Change the code to a new 4-digit number
4. Click **Save**

### A bike is broken and shouldn't be rented
1. Go to **Bikes** → select the bike
2. Note the ID
3. Go to **Bike Fleet**
4. Find the bike and click **Remove** (if it's not being rented)
5. If it's being rented, wait for the rental to complete first

### I want to change bike rental prices
1. Go to **Pricing** in the sidebar
2. Update the price for Electric or Non-Electric bikes
3. Click **"Save Prices"**
4. All bikes of that type will use the new price

### A user is stuck in an active rental
1. Go to **Rental Sessions**
2. Find their rental with "active" status
3. You may need to manually update the database
4. Or ask them to complete the return process

### How do I see bike availability?
1. Go to **Bike Fleet**
2. Look at the "Status" column:
   - **Green "available"** = ready to rent
   - **Yellow "in-use"** = currently rented

---

## API Testing (for developers)

### User Login
```bash
curl -X POST http://localhost:8787/api/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"johnnexon","password":"password"}'
```

### Admin Login
```bash
curl -X POST http://localhost:8787/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get All Bikes
```bash
curl http://localhost:8787/api/bikes
```

### Get Active Rental for User
```bash
curl http://localhost:8787/api/rentals/active/johnnexon
```

---

## Troubleshooting

**Can't log in to mobile app**
- Check that username and password are correct
- Make sure you registered first
- Try logging in from another app to verify credentials work

**Bike doesn't appear in mobile app after adding**
- Wait a few seconds for the database to sync
- Try closing and reopening the app
- Check admin dashboard to confirm bike was saved

**Can't log in to admin dashboard**
- Verify you're using the correct credentials
- Username: `admin` Password: `admin123`
- Check that admin table exists in Supabase

**Payment box code is wrong**
- Admin can update it in **Bikes** → **Bike Fleet** → **Edit**
- Make sure to use the correct lockbox code

**User can't return bike**
- Make sure they lock the bike back to the rack first
- Try taking a clear photo of the bike
- Ensure lockbox code is correct for key return

---

## Support Contacts

For technical issues:
- Check database in Supabase dashboard
- Check server logs on Railway/Heroku
- Check mobile app logs (Expo console)
- Check admin dashboard browser console (F12)

---

Enjoy your bike rental service! 🚴
