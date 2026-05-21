# Vercel Backend Deployment - Complete Setup Guide

## Overview

Your Express backend will run as Vercel Serverless Functions. No need to convert all routes individually - we'll use Express on Vercel with a simple wrapper.

## Step-by-Step Instructions

### Step 1: Prepare Your Server for Vercel

Your current `server/index.js` works great! We just need to add one file and update package.json.

**File: `server/vercel.json`** (Create this file)

```json
{
  "buildCommand": "npm install",
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
        }
      ]
    }
  ]
}
```

### Step 2: Update package.json

Open `server/package.json` and verify these fields:

```json
{
  "name": "bike-rental-server",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.x.x",
    "cors": "^2.8.5",
    "dotenv": "^16.x.x",
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1"
  }
}
```

**Make sure your server can start with `npm start`**

### Step 3: Create Wrapper for Vercel (Optional but Recommended)

Create file: `server/api/index.js`

```javascript
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(cors())
app.use(express.json())

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// --- USER LOGIN ---
app.post('/login', async (req, res) => {
  const { userId, password } = req.body
  if (!userId || !password) {
    return res.status(400).json({ error: 'userId and password are required' })
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, password, role, name, email')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (data.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const { password: _, ...userWithoutPassword } = data
    res.json(userWithoutPassword)
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// --- USER REGISTRATION ---
app.post('/register', async (req, res) => {
  const { userId, password, name, email } = req.body
  
  if (!userId || !password || !name || !email) {
    return res.status(400).json({ error: 'userId, password, name, and email are required' })
  }

  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingUser && !checkError) {
      return res.status(409).json({ error: 'Username already exists' })
    }

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        id: userId,
        username: userId,
        password: password,
        name: name,
        email: email,
        role: 'user',
      })
      .select('id, name, email, role')
      .single()

    if (createError) throw createError

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
    })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// --- ADMIN LOGIN ---
app.post('/admin/login', async (req, res) => {
  const { username, password } = req.body
  
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' })
  }

  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, name')
      .eq('username', username)
      .single()

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const { data: adminData, error: pwError } = await supabase
      .from('admins')
      .select('password')
      .eq('username', username)
      .single()

    if (pwError || adminData.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    res.json({
      message: 'Admin login successful',
      admin: {
        id: data.id,
        username: data.username,
        name: data.name,
      },
    })
  } catch (err) {
    console.error('Admin login error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// --- GET ALL BIKES ---
app.get('/bikes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bikes')
      .select('*')

    if (error) throw error
    res.json(data || [])
  } catch (err) {
    console.error('Fetch bikes error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// --- ADD BIKE ---
app.post('/bikes', async (req, res) => {
  const { id, name, station, lockboxCode, bikeType, price } = req.body

  if (!id || !name || !station || !lockboxCode || !bikeType) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const { data, error } = await supabase
      .from('bikes')
      .insert({
        id,
        name,
        station,
        lockbox_code: lockboxCode,
        bike_type: bikeType,
        price: price || 500,
        status: 'available',
      })
      .select('*')
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    console.error('Add bike error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// --- UPDATE BIKE ---
app.put('/bikes/:id', async (req, res) => {
  const { id } = req.params
  const updates = req.body

  if (updates.lockboxCode) {
    updates.lockbox_code = updates.lockboxCode
    delete updates.lockboxCode
  }
  if (updates.bikeType) {
    updates.bike_type = updates.bikeType
    delete updates.bikeType
  }

  try {
    const { data, error } = await supabase
      .from('bikes')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('Update bike error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// --- DELETE BIKE ---
app.delete('/bikes/:id', async (req, res) => {
  const { id } = req.params

  try {
    const { error } = await supabase
      .from('bikes')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json({ message: 'Bike deleted' })
  } catch (err) {
    console.error('Delete bike error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// --- UPDATE PRICING BY TYPE ---
app.put('/bikes/update-price-by-type', async (req, res) => {
  const { bikeType, price } = req.body

  if (!bikeType || price === undefined) {
    return res.status(400).json({ error: 'bikeType and price are required' })
  }

  try {
    const { data, error } = await supabase
      .from('bikes')
      .update({ price })
      .eq('bike_type', bikeType)
      .select('*')

    if (error) throw error
    res.json({ message: 'Prices updated', updated: data.length })
  } catch (err) {
    console.error('Update pricing error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// --- GET RENTALS ---
app.get('/rentals', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rentals')
      .select('*')
      .order('started_at', { ascending: false })

    if (error) throw error
    
    const formattedData = data.map(r => ({
      sessionId: r.session_id,
      bikeId: r.bike_id,
      bikeName: r.bike_name,
      customer: { userId: r.customer_id },
      rentalStatus: r.rental_status,
      startedAt: r.started_at,
      endedAt: r.ended_at,
    }))

    res.json(formattedData)
  } catch (err) {
    console.error('Fetch rentals error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// --- GET ACTIVE RENTAL ---
app.get('/rentals/active/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const { data, error } = await supabase
      .from('rentals')
      .select('*')
      .eq('customer_id', userId)
      .eq('rental_status', 'active')
      .single()

    if (error) {
      return res.json(null)
    }

    const rental = {
      sessionId: data.session_id,
      bikeId: data.bike_id,
      bikeName: data.bike_name,
      customer: { userId: data.customer_id },
      rentalStatus: data.rental_status,
      startedAt: data.started_at,
      lockboxCode: data.lockbox_code,
    }

    res.json(rental)
  } catch (err) {
    console.error('Fetch active rental error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// --- GET NOTIFICATIONS ---
app.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    res.json(data || [])
  } catch (err) {
    console.error('Fetch notifications error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default app
```

### Step 4: Deploy to Vercel

1. **Make sure files are pushed to GitHub**
   ```bash
   git add .
   git commit -m "Add Vercel configuration for backend"
   git push
   ```

2. **Create new Vercel project for backend:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select **Root Directory:** `server`
   - Click "Continue"

3. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add two variables:
     - Key: `SUPABASE_URL`
     - Value: `https://okynwmzzodvxeeputbvn.supabase.co`
     - Key: `SUPABASE_ANON_KEY`
     - Value: `sb_publishable_hKZ4hTdQY8dK4Bi3x8R_9Q_cfYzYJ1L`

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - You'll get a URL like `https://your-project.vercel.app`

### Step 5: Update Your Apps

**Mobile App** (`mobile-app/App.js` line 11):
```javascript
const API_BASE_URL = 'https://your-project.vercel.app/api'
```

**Web Dashboard** (`web/src/App.jsx` line 3):
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || "https://your-project.vercel.app"
```

**Web Dashboard Vercel Environment Variables:**
- Key: `VITE_API_BASE`
- Value: `https://your-project.vercel.app`

### Step 6: Verify Deployment

Test your backend with:
```bash
# Get all bikes
curl https://your-project.vercel.app/api/bikes

# User login
curl -X POST https://your-project.vercel.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"johnnexon","password":"password"}'

# Admin login
curl -X POST https://your-project.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## Summary: What You Now Have

✅ **Web Dashboard** on Vercel (free)
✅ **Backend Server** on Vercel (free)
✅ **Mobile App** via Expo (free)
✅ **Database** on Supabase (free tier)
✅ **Everything permanently free!**

No Railway. No Heroku. Just Vercel. 🚀

---

## Troubleshooting

**Backend not responding:**
- Check Vercel deployment logs
- Verify Supabase credentials in environment variables
- Check CORS headers are set

**Mobile app can't connect:**
- Verify API_BASE_URL is correct
- Test with curl first
- Check browser console for network errors

**API returns 404:**
- Make sure you're using `/api/` prefix
- Check vercel.json is in server folder
- Re-deploy after pushing changes

All 3 components on **one billing account (Vercel)** = simpler management! 💰
