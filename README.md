# 🎫 Event Booking System

A comprehensive event booking platform with AI-powered features, secure payments, and role-based dashboards.

## ✨ Key Features

- 🎟️ **Multiple Ticket Types** - General, VIP, Premium, Early Bird, Student
- 🎁 **Combo Passes** - Bundle events with automatic discounts (25-30% off)
- 💺 **Visual Seat Selection** - Interactive 8x10 seat grid
- ⏳ **Waiting List** - Auto-notification when sold-out events have availability
- 💳 **Secure Payments** - Razorpay/Stripe integration with demo mode
- 📱 **QR Codes** - Downloadable tickets for event entry
- 📄 **Invoice/Receipt** - PDF invoices and text receipts
- 🤖 **AI Features** - Recommendations, dynamic pricing, fraud detection
- 📧 **Auto Emails** - Booking confirmations, cancellations, reminders, refunds
- 🔐 **Role-Based Access** - User, Organizer, Admin dashboards

## 🛠️ Tech Stack

**Frontend:** React + Vite, Material-UI, Tailwind CSS, Framer Motion  
**Backend:** Node.js, Express, MongoDB, JWT Auth  
**Payments:** Razorpay/Stripe (auto-detects demo mode)  
**Features:** QRCode, PDFKit, Nodemailer

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Configure Environment

**server/.env** - Already configured with demo settings!
```env
MONGODB_URI=mongodb://localhost:27017/event-booking-system
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
# Payment keys optional - auto-enables demo mode if missing
```

### 3. Seed Database with Demo Data
```bash
cd server
node utils/seed.js
```

### 4. Start Application
```bash
npm run dev
```

**Access:** http://localhost:5173 (Frontend) | http://localhost:5000 (Backend)

## 👥 Demo Credentials

```
👑 Admin:     admin@eventbooking.com / Admin@123
🎪 Organizer: organizer@eventbooking.com / Organizer@123  
👤 User:      user@eventbooking.com / User@123
```

## 🎬 Demo Features to Show

### User Flow
1. Browse 10 seeded events (Music festivals, Tech conferences, Comedy shows)
2. Filter by category, date, location, price
3. Book individual tickets with seat selection
4. Purchase combo passes (save 25-30%)
5. View tickets with QR codes
6. Download invoices and receipts
7. Join waiting list for sold-out events
8. View booking history (Confirmed/Pending/Cancelled/Refunded)

### Organizer Flow
1. Create/Edit events with multiple ticket types
2. View event analytics (sales, revenue, attendance)
3. Track ticket sales by type
4. Get AI dynamic pricing suggestions
5. Manage attendees

### Admin Flow
1. View all users and organizers
2. Monitor platform-wide revenue
3. Check fraud detection alerts
4. Approve refund requests
5. View analytics dashboard

## 📊 Pre-Seeded Data

- ✅ **7 Users** (Admin, 2 Organizers, 4 Users)
- ✅ **10 Events** (Entertainment, Professional, Social categories)
- ✅ **6 Bookings** (Various statuses for demonstration)
- ✅ **6 Payments** (Completed, Pending, Refunded)
- ✅ **3 Combo Passes** (Entertainment, Tech, Premium VIP)
- ✅ **3 Waiting List Entries** (For sold-out comedy show)
- ✅ **4 Reviews** (5-star ratings)

## 🎯 All Requirements Implemented

✅ Individual & combo booking with discounts  
✅ Secure checkout & failed transaction handling  
✅ Receipt & invoice downloads  
✅ User authentication & role-based authorization  
✅ AI recommendations, pricing, fraud detection  
✅ Email/SMS confirmations (6 types)  
✅ Real-time seat availability  
✅ Waiting list management  
✅ Automated refund processing  
✅ QR code generation  
✅ Encrypted data & secure payments  
✅ Duplicate booking prevention  
✅ Session timeout & authorization  
✅ Search & filter (category, date, location, price, popularity)  
✅ Event details (description, schedule, venue, seats)  
✅ Limited-time offer countdown  
✅ Auto-confirm on payment success  
✅ Transaction logs (Confirmed/Pending/Cancelled/Refunded)  
✅ Admin panel (event/ticket/user/organizer/refund management)  
✅ Analytics dashboards (sales, revenue, attendance)  
✅ Organizer dashboard (performance, tracking, revenue)  
✅ User dashboard (booked events, history, downloads, cancellation)

## 📁 Project Structure

```
event-booking-system/
├── client/          # React frontend
├── server/          # Express backend
│   ├── models/      # MongoDB schemas (7 models)
│   ├── controllers/ # Business logic (50+ endpoints)
│   ├── routes/      # API routes
│   ├── utils/       # Email, Invoice, Seed scripts
│   └── middleware/  # Auth, Rate limiting
└── package.json     # Root package with scripts
```

## 🔒 Security

- JWT authentication with bcrypt
- Rate limiting & CORS protection
- XSS & injection prevention
- Secure payment gateway integration
- Session timeout handling

---

**🎥 Ready for Screen Recording!** All features are implemented and seeded with demo data.
