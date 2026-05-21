# 🚴 Bike Rental App

A full-stack bike rental application for tourists in Hiraizumi, Japan. Includes a mobile app for renting bikes, a web admin dashboard for management, and a backend server with Supabase database.

## Features

### 📱 Mobile App (React Native/Expo)
- User registration and authentication
- Browse available bikes in real-time
- One-click bike rental with payment confirmation
- Active rental tracking and continuation
- Bike return process with photo verification
- User profile screen
- Secure logout

### 🖥️ Admin Dashboard (React + Vite)
- Admin authentication with separate login
- Real-time bike fleet management
- Add, edit, and remove bikes
- Dynamic pricing by bike type (electric/non-electric)
- Live rental session monitoring
- Admin notifications
- Responsive sidebar navigation

### 🔧 Backend Server (Express.js)
- User registration & login API
- Admin authentication
- Bike management endpoints
- Rental lifecycle management (start, progress, return)
- Payment handling (offline cash method)
- Notification system
- Real-time data sync with Supabase

### 💾 Database (Supabase PostgreSQL)
- Users table (for customers)
- Admins table (for dashboard access)
- Bikes table (fleet inventory)
- Rentals table (rental history)
- Notifications table (system alerts)

## Project Structure

```
bike-rental-app/
├── mobile-app/          # React Native/Expo mobile application
│   ├── App.js          # Main app component with all screens
│   ├── app.json        # Expo config
│   └── package.json
├── web/                # React + Vite admin dashboard
│   ├── src/
│   │   └── App.jsx     # Main dashboard component
│   ├── index.html
│   └── package.json
├── server/             # Express.js backend
│   ├── index.js        # Main server file with all APIs
│   ├── .env            # Environment variables
│   └── package.json
├── DEPLOYMENT_GUIDE.md # Complete deployment instructions
├── QUICK_START.md      # User & admin quick start guide
├── ADMIN_LOGIN_SETUP.md # Admin dashboard setup
└── README.md          # This file
```

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Mobile | React Native + Expo | Latest |
| Dashboard | React + Vite | 5.0+ |
| Backend | Express.js | 4.x |
| Database | Supabase (PostgreSQL) | - |
| State Management | React Context API | - |
| Storage | AsyncStorage (mobile) | - |
| Styling | React Native StyleSheet, Tailwind (web) | - |

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI (for mobile development)
- Supabase account

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/bike-rental-app.git
   cd bike-rental-app
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   # Create .env file with Supabase credentials
   npm start
   # Server runs on http://localhost:8787
   ```

3. **Setup Web Dashboard**
   ```bash
   cd ../web
   npm install
   npm run dev
   # Dashboard runs on http://localhost:5173
   ```

4. **Setup Mobile App**
   ```bash
   cd ../mobile-app
   npm install
   npm start
   # Scan QR code with Expo Go or run on emulator
   ```

## Environment Variables

### Server (.env)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
PORT=8787
```

### Web Dashboard (.env or .env.local)
```
VITE_API_BASE=http://localhost:8787/api
```

### Mobile App
Update `API_BASE_URL` in `App.js` Line 11

## Quick Demo Credentials

**User Accounts:**
- Username: `johnnexon` / Password: `password`
- Username: `user1` / Password: `password`
- Username: `user2` / Password: `password`

**Admin Account:**
- Username: `admin` / Password: `admin123`

## Database Schema

See Supabase dashboard or `ADMIN_SETUP.sql` for full schema details.

**Key Tables:**
- `users` - Customer accounts
- `admins` - Admin accounts
- `bikes` - Bike fleet inventory
- `rentals` - Rental sessions & history
- `notifications` - System alerts

## API Documentation

### User APIs
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `GET /api/bikes` - Get all bikes
- `GET /api/rentals/active/:userId` - Get active rental
- `POST /api/rentals/start` - Start rental
- `POST /api/rentals/start-return` - Begin return process
- `POST /api/rentals/confirm-return` - Complete return

### Admin APIs
- `POST /api/admin/login` - Admin login
- `GET /api/bikes` - List all bikes
- `POST /api/bikes` - Add new bike
- `PUT /api/bikes/:id` - Update bike
- `DELETE /api/bikes/:id` - Remove bike
- `PUT /api/bikes/update-price-by-type` - Update pricing
- `GET /api/rentals` - List all rentals
- `GET /api/notifications` - Get system notifications

See `server/index.js` for complete API reference.

## Deployment

For complete deployment instructions, see **DEPLOYMENT_GUIDE.md**

Quick summary:
1. Push to GitHub
2. Deploy mobile app via Expo, App Store, or Play Store
3. Deploy web dashboard to Vercel
4. Deploy backend to Railway, Heroku, or your own VPS
5. Update API URLs in mobile app and dashboard

## Features in Development

- [ ] Sightseeing location tracking
- [ ] Tourist information points of interest
- [ ] Bcrypt password hashing for security
- [ ] Email verification
- [ ] Password reset functionality
- [ ] User payment history
- [ ] Bike damage reporting
- [ ] Multi-language support (Japanese/English)
- [ ] Push notifications

## Security Notes

⚠️ **Before Production:**
- Change admin password from default `admin123`
- Enable HTTPS/SSL on all endpoints
- Implement bcrypt password hashing (currently plain text for demo)
- Set up rate limiting on APIs
- Configure CORS properly for your domains
- Use environment variables for all credentials
- Add database backups
- Set up monitoring and error logging

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is for the Hiraizumi bike rental service.

## Support

For issues, questions, or suggestions:
- Check DEPLOYMENT_GUIDE.md for deployment help
- Check QUICK_START.md for usage help
- Check ADMIN_LOGIN_SETUP.md for admin setup
- Review API errors in server logs
- Check browser console (web) / Expo console (mobile)

## Acknowledgments

- Built with React Native, Express.js, and Supabase
- Designed for Hiraizumi, Japan bike rental system
- Uses Candyhouse Sesame smart locks integration

---

**Ready to deploy? Check out DEPLOYMENT_GUIDE.md!** 🚀
