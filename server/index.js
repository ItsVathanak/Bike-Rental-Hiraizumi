import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(cors())
app.use(express.json())

// Configure multer for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() })

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

function nowIso() {
  return new Date().toISOString()
}

function generateSessionId() {
  return `rental-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

// --- User Authentication ---
app.post('/login', async (req, res) => {
  const { userId, password } = req.body
  if (!userId || !password) {
    return res.status(400).json({ error: 'userId and password are required' })
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, password, role, name')
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

// Register new user
app.post('/register', async (req, res) => {
  const { userId, password, name, email } = req.body
  
  if (!userId || !password || !name || !email) {
    return res.status(400).json({ error: 'userId, password, name, and email are required' })
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    // If no error and user exists, reject registration
    if (existingUser && !checkError) {
      return res.status(409).json({ error: 'Username already exists' })
    }

    // Create new user
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

// Admin login
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

    // Check password (in production, use bcrypt)
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

// Get active rental for a user
app.get('/rentals/active/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const { data: rental, error } = await supabase
      .from('rentals')
      .select('*')
      .eq('customer_id', userId)
      .eq('rental_status', 'active')
      .single()

    if (error) {
      return res.json(null)
    }

    if (!rental) {
      return res.json(null)
    }

    const { data: bike } = await supabase
      .from('bikes')
      .select('name')
      .eq('id', rental.bike_id)
      .single()

    res.json({
      sessionId: rental.session_id,
      bikeId: rental.bike_id,
      bikeName: bike?.name || 'Unknown Bike',
      customer: { userId: rental.customer_id },
      paymentStatus: rental.payment_status,
      paymentMethod: rental.payment_method,
      rentalStatus: rental.rental_status,
      lockboxCode: rental.lockbox_code,
      createdAt: rental.created_at,
      startedAt: rental.started_at,
      events: rental.events,
    })
  } catch (err) {
    console.error('Error fetching active rental:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// List bikes
app.get('/bikes', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bikes')
      .select('id, name, status, station, lockbox_code, bike_type, price')

    if (error) throw error

    res.json(data.map(bike => ({
      id: bike.id,
      name: bike.name,
      status: bike.status,
      station: bike.station,
      lockboxCode: bike.lockbox_code,
      bikeType: bike.bike_type,
      price: bike.price,
    })))
  } catch (err) {
    console.error('Error fetching bikes:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get all rental sessions
app.get('/rentals', async (req, res) => {
  try {
    const { data: rentals, error } = await supabase
      .from('rentals')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const detailedRentals = await Promise.all(rentals.map(async (rental) => {
      const { data: bike } = await supabase
        .from('bikes')
        .select('name')
        .eq('id', rental.bike_id)
        .single()

      return {
        sessionId: rental.session_id,
        bikeId: rental.bike_id,
        bikeName: bike?.name || 'Unknown Bike',
        customer: { userId: rental.customer_id },
        paymentStatus: rental.payment_status,
        rentalStatus: rental.rental_status,
        lockboxCode: rental.lockbox_code,
        createdAt: rental.created_at,
        startedAt: rental.started_at,
        endedAt: rental.ended_at,
        events: rental.events,
      }
    }))

    res.json(detailedRentals)
  } catch (err) {
    console.error('Error fetching rentals:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/rentals', async (req, res) => {
  const { bikeId, userId } = req.body

  if (!bikeId || !userId) {
    return res.status(400).json({ message: 'bikeId and userId are required' })
  }

  try {
    const { data: bike, error: bikeError } = await supabase
      .from('bikes')
      .select('*')
      .eq('id', bikeId)
      .single()

    if (bikeError || !bike) {
      return res.status(404).json({ message: 'Bike not found' })
    }

    if (bike.status !== 'available') {
      return res.status(409).json({ message: 'Bike is not available' })
    }

    const sessionId = generateSessionId()
    const now = nowIso()
    const initialEvents = [{
      type: 'session_started',
      timestamp: now,
      customer: { userId },
    }]

    const { error: insertError } = await supabase
      .from('rentals')
      .insert({
        session_id: sessionId,
        bike_id: bikeId,
        customer_id: userId,
        payment_status: 'paid',
        payment_method: 'cash',
        rental_status: 'active',
        lockbox_code: bike.lockbox_code,
        created_at: now,
        started_at: now,
        events: initialEvents,
      })

    if (insertError) throw insertError

    const { error: updateError } = await supabase
      .from('bikes')
      .update({ status: 'rented' })
      .eq('id', bikeId)

    if (updateError) throw updateError

    res.status(201).json({
      sessionId,
      bikeId,
      customer: { userId },
      paymentStatus: 'paid',
      rentalStatus: 'active',
      lockboxCode: bike.lockbox_code,
      createdAt: now,
      startedAt: now,
      events: initialEvents,
    })
  } catch (err) {
    console.error('Error creating rental:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/rentals/start-return', async (req, res) => {
  const { userId } = req.body

  try {
    const { data: rental, error: fetchError } = await supabase
      .from('rentals')
      .select('*')
      .eq('customer_id', userId)
      .eq('rental_status', 'active')
      .single()

    if (fetchError || !rental) {
      return res.status(404).json({ message: 'Active rental not found.' })
    }

    const { data: bike } = await supabase
      .from('bikes')
      .select('id')
      .eq('id', rental.bike_id)
      .single()

    if (!bike) {
      return res.status(404).json({ message: 'Associated bike not found.' })
    }

    const returnInfo = {
      startedAt: nowIso(),
    }

    const events = rental.events || []
    events.push({
      type: 'return_process_started',
      timestamp: nowIso(),
    })

    const { error: updateError } = await supabase
      .from('rentals')
      .update({
        return_info: returnInfo,
        events,
      })
      .eq('session_id', rental.session_id)

    if (updateError) throw updateError

    console.log('Return process started for rental:', rental.session_id)
    res.json({
      sessionId: rental.session_id,
      bikeId: rental.bike_id,
      customer: { userId: rental.customer_id },
      rentalStatus: rental.rental_status,
      lockboxCode: rental.lockbox_code,
      returnInfo,
      events,
    })
  } catch (err) {
    console.error('Error starting return:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

app.post('/rentals/return', upload.single('photo'), async (req, res) => {
  const { sessionId } = req.body

  if (!sessionId) {
    return res.status(400).json({ message: 'sessionId is required' })
  }

  try {
    const { data: rental, error: fetchError } = await supabase
      .from('rentals')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (fetchError || !rental) {
      return res.status(404).json({ message: 'Rental session not found.' })
    }

    if (rental.rental_status !== 'active') {
      return res.status(409).json({
        message: `Cannot return a bike that is not active. Status: ${rental.rental_status}`,
      })
    }

    if (!rental.return_info) {
      return res.status(400).json({
        message: 'Return process was not started correctly.',
      })
    }

    let photoUrl = null
    const events = rental.events || []

    // Handle photo upload to Supabase Storage
    if (req.file) {
      try {
        const timestamp = Date.now()
        const fileName = `${sessionId}-${timestamp}.jpg`
        const filePath = `public/${fileName}`

        console.log('Attempting photo upload:', { filePath, size: req.file.size, mimetype: req.file.mimetype })

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('rental-photos')
          .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          })

        if (uploadError) {
          console.error('Supabase upload error:', uploadError)
          throw new Error(`Upload failed: ${uploadError.message}`)
        }

        console.log('Upload successful:', uploadData)

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('rental-photos')
          .getPublicUrl(filePath)

        photoUrl = urlData?.publicUrl

        if (!photoUrl) {
          throw new Error('Failed to generate public URL')
        }

        console.log('Public URL generated:', photoUrl)

        events.push({
          type: 'photo_received',
          timestamp: nowIso(),
          filename: fileName,
          size: req.file.size,
          photoUrl: photoUrl,
        })
      } catch (uploadErr) {
        console.error('Photo upload error:', uploadErr.message || uploadErr)
        return res.status(500).json({ message: `Failed to upload photo: ${uploadErr.message}` })
      }
    } else {
      events.push({
        type: 'photo_received',
        timestamp: nowIso(),
        filename: 'no-photo',
        size: 0,
      })
    }

    const { data: bike } = await supabase
      .from('bikes')
      .select('*')
      .eq('id', rental.bike_id)
      .single()

    if (!bike) {
      return res.status(404).json({ message: 'Associated bike not found.' })
    }

    const now = nowIso()
    events.push({
      type: 'rental_returned',
      timestamp: now,
    })

    const { error: updateRentalError } = await supabase
      .from('rentals')
      .update({
        rental_status: 'returned',
        ended_at: now,
        photo_url: photoUrl,
        events,
      })
      .eq('session_id', sessionId)

    if (updateRentalError) throw updateRentalError

    const { error: updateBikeError } = await supabase
      .from('bikes')
      .update({ status: 'available' })
      .eq('id', rental.bike_id)

    if (updateBikeError) throw updateBikeError

    // Notify user
    await supabase.from('notifications').insert({
      to_user_id: rental.customer_id,
      message: `Your rental for ${bike.name} is complete. Thank you!`,
      read: false,
    })

    // Notify admins
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')

    if (admins && admins.length > 0) {
      const adminNotifications = admins.map(admin => ({
        to_user_id: admin.id,
        message: `Bike ${bike.name} was returned. Please update the lockbox code.`,
        read: false,
      }))
      await supabase.from('notifications').insert(adminNotifications)
    }

    res.json({ message: 'Bike returned successfully', rental })
  } catch (err) {
    console.error('Error returning rental:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Notifications
app.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('to_user_id', userId)
      .eq('read', false)
      .order('timestamp', { ascending: false })

    if (error) throw error

    res.json(notifications.map(n => ({
      to: n.to_user_id,
      message: n.message,
      timestamp: n.timestamp,
      read: n.read,
    })))

    // Mark as read
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('to_user_id', userId)
      .eq('read', false)
  } catch (err) {
    console.error('Error fetching notifications:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get all notifications for admin
app.get('/notifications/admin', async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('read', false)
      .order('timestamp', { ascending: false })

    if (error) throw error

    res.json(notifications.map(n => ({
      to: n.to_user_id,
      message: n.message,
      timestamp: n.timestamp,
      read: n.read,
    })))

    // Mark as read
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)
  } catch (err) {
    console.error('Error fetching admin notifications:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get a single rental session
app.get('/rentals/:id', async (req, res) => {
  try {
    const { data: rental, error } = await supabase
      .from('rentals')
      .select('*')
      .eq('session_id', req.params.id)
      .single()

    if (error || !rental) {
      return res.status(404).json({ error: 'Rental session not found' })
    }

    res.json(rental)
  } catch (err) {
    console.error('Error fetching rental:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Admin actions
app.post('/bikes', async (req, res) => {
  const { id, name, station, lockboxCode, bikeType } = req.body

  if (!id || !name || !station || !lockboxCode || !bikeType) {
    return res.status(400).json({
      error: 'id, name, station, lockboxCode, and bikeType are required',
    })
  }

  if (!/^\d{4}$/.test(lockboxCode)) {
    return res.status(400).json({ error: 'Lockbox code must be exactly 4 digits' })
  }

  if (!['electric', 'non-electric'].includes(bikeType)) {
    return res.status(400).json({ error: 'bikeType must be either "electric" or "non-electric"' })
  }

  try {
    const { data: existingBike } = await supabase
      .from('bikes')
      .select('id')
      .eq('id', id)
      .single()

    if (existingBike) {
      return res.status(409).json({ error: `Bike with id ${id} already exists` })
    }

    // Get the price for the bike type
    const { data: bikeTypeData, error: priceError } = await supabase
      .from('bikes')
      .select('price')
      .eq('bike_type', bikeType)
      .limit(1)
      .single()

    const price = bikeTypeData?.price || (bikeType === 'electric' ? 1000 : 500)

    const { data: newBike, error } = await supabase
      .from('bikes')
      .insert({
        id,
        name,
        station,
        status: 'available',
        lockbox_code: lockboxCode,
        bike_type: bikeType,
        price,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      id: newBike.id,
      name: newBike.name,
      station: newBike.station,
      status: newBike.status,
      lockboxCode: newBike.lockbox_code,
    })
  } catch (err) {
    console.error('Error creating bike:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update bike prices by type
app.put('/bikes/update-price-by-type', async (req, res) => {
  const { bikeType, price } = req.body

  if (!bikeType || price === undefined || price === null) {
    return res.status(400).json({
      error: 'bikeType and price are required',
    })
  }

  try {
    const { error } = await supabase
      .from('bikes')
      .update({ price: Number(price) })
      .eq('bike_type', bikeType)

    if (error) throw error

    res.json({
      message: `Updated all ${bikeType} bikes to ¥${price}`,
      bikeType,
      price,
    })
  } catch (err) {
    console.error('Error updating bike prices:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.put('/bikes/:id', async (req, res) => {
  const { name, station, status, lockboxCode } = req.body

  if (lockboxCode && !/^\d{4}$/.test(lockboxCode)) {
    return res.status(400).json({ error: 'Lockbox code must be exactly 4 digits' })
  }

  try {
    const updateData = {}
    if (name) updateData.name = name
    if (station) updateData.station = station
    if (status) updateData.status = status
    if (lockboxCode) updateData.lockbox_code = lockboxCode

    const { data: updatedBike, error } = await supabase
      .from('bikes')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error || !updatedBike) {
      return res.status(404).json({ error: 'Bike not found' })
    }

    res.json({
      id: updatedBike.id,
      name: updatedBike.name,
      station: updatedBike.station,
      status: updatedBike.status,
      lockboxCode: updatedBike.lockbox_code,
    })
  } catch (err) {
    console.error('Error updating bike:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

app.delete('/bikes/:id', async (req, res) => {
  try {
    const { data: bike, error: fetchError } = await supabase
      .from('bikes')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (fetchError || !bike) {
      return res.status(404).json({ error: 'Bike not found' })
    }

    if (bike.status !== 'available') {
      return res.status(409).json({
        error: 'Cannot delete a bike that is currently in use',
      })
    }

    const { error: deleteError } = await supabase
      .from('bikes')
      .delete()
      .eq('id', req.params.id)

    if (deleteError) throw deleteError

    res.json({ message: `Bike ${bike.id} deleted`, deletedBike: bike })
  } catch (err) {
    console.error('Error deleting bike:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});