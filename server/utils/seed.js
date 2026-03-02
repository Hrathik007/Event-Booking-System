const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const ComboPass = require('../models/ComboPass');
const WaitingList = require('../models/WaitingList');
const Review = require('../models/Review');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await ComboPass.deleteMany();
    await WaitingList.deleteMany();
    await Review.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eventbooking.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '9876543210',
      isActive: true,
    });

    const organizer = await User.create({
      name: 'John Organizer',
      email: 'organizer@eventbooking.com',
      password: 'Organizer@123',
      role: 'organizer',
      phone: '9876543211',
      isActive: true,
    });

    const user = await User.create({
      name: 'Demo User',
      email: 'user@eventbooking.com',
      password: 'User@123',
      role: 'user',
      phone: '9876543212',
      interests: ['entertainment', 'professional', 'sports'],
      isActive: true,
    });

    // Create additional users for testing
    const user2 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: 'User@123',
      role: 'user',
      phone: '9876543213',
      interests: ['entertainment', 'social'],
      isActive: true,
    });

    const user3 = await User.create({
      name: 'Michael Chen',
      email: 'michael@example.com',
      password: 'User@123',
      role: 'user',
      phone: '9876543214',
      interests: ['professional', 'conference'],
      isActive: true,
    });

    const organizer2 = await User.create({
      name: 'EventPro Team',
      email: 'eventpro@eventbooking.com',
      password: 'Organizer@123',
      role: 'organizer',
      phone: '9876543215',
      isActive: true,
    });

    console.log('✅ Created users');

    // Create sample events
    const events = [
      {
        title: 'Summer Music Festival 2026',
        description: 'Join us for the biggest music festival of the year featuring top artists from around the world. Experience live performances, food stalls, and amazing vibes!',
        category: 'entertainment',
        subCategory: 'festival',
        organizer: organizer._id,
        organizerName: organizer.name,
        bannerImage: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
        venue: {
          name: 'Grand Arena',
          address: '123 Music Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          zipCode: '400001',
        },
        date: {
          start: new Date('2026-06-15'),
          end: new Date('2026-06-17'),
        },
        ticketTypes: [
          { name: 'General', price: 1500, totalSeats: 1000, availableSeats: 1000, benefits: ['Entry to all stages', 'Food court access'] },
          { name: 'VIP', price: 5000, totalSeats: 200, availableSeats: 200, benefits: ['Priority entry', 'VIP lounge', 'Backstage access', 'Complimentary food'] },
          { name: 'Early Bird', price: 1000, totalSeats: 500, availableSeats: 500, benefits: ['Discounted price', 'Entry to all stages'], validUntil: new Date('2026-05-15') },
        ],
        totalSeats: 1700,
        availableSeats: 1700,
        pricing: { min: 1000, max: 5000, currency: 'INR' },
        features: ['Live Music', 'Food & Beverages', 'Parking', 'Security'],
        tags: ['music', 'festival', 'outdoor', 'concert'],
        status: 'published',
        isFeatured: true,
      },
      {
        title: 'Tech Conference 2026',
        description: 'The premier technology conference featuring industry leaders, workshops, and networking opportunities. Learn about the latest in AI, Cloud, and Web3.',
        category: 'professional',
        subCategory: 'conference',
        organizer: organizer._id,
        organizerName: organizer.name,
        bannerImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678',
        venue: {
          name: 'Convention Center',
          address: '456 Tech Park',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          zipCode: '560001',
        },
        date: {
          start: new Date('2026-07-20'),
          end: new Date('2026-07-22'),
        },
        ticketTypes: [
          { name: 'General', price: 3000, totalSeats: 500, availableSeats: 500, benefits: ['Access to all sessions', 'Conference kit'] },
          { name: 'VIP', price: 8000, totalSeats: 100, availableSeats: 100, benefits: ['Priority seating', 'VIP lounge', 'Lunch included', 'Networking dinner'] },
        ],
        totalSeats: 600,
        availableSeats: 600,
        pricing: { min: 3000, max: 8000, currency: 'INR' },
        features: ['Workshops', 'Networking', 'Lunch', 'Swag Bag'],
        tags: ['technology', 'conference', 'networking', 'professional'],
        status: 'published',
        isFeatured: true,
      },
      {
        title: 'Stand-Up Comedy Night',
        description: 'Get ready for a night of non-stop laughter with some of the funniest comedians in the country!',
        category: 'entertainment',
        subCategory: 'standup',
        organizer: organizer._id,
        organizerName: organizer.name,
        bannerImage: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca',
        venue: {
          name: 'Comedy Club',
          address: '789 Laugh Lane',
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          zipCode: '110001',
        },
        date: {
          start: new Date('2026-05-10'),
          end: new Date('2026-05-10'),
        },
        ticketTypes: [
          { name: 'General', price: 500, totalSeats: 200, availableSeats: 0, benefits: ['Seating', 'Entry'] }, // SOLD OUT
          { name: 'Premium', price: 1000, totalSeats: 50, availableSeats: 0, benefits: ['Front row seating', 'Complimentary drink'] }, // SOLD OUT
        ],
        totalSeats: 250,
        availableSeats: 0, // SOLD OUT for waiting list demo
        pricing: { min: 500, max: 1000, currency: 'INR' },
        features: ['Comedy', 'Bar', 'Air Conditioned'],
        tags: ['comedy', 'standup', 'entertainment', 'nightlife'],
        status: 'published',
        isFeatured: true,
      },
      {
        title: 'Digital Marketing Workshop',
        description: 'Master the art of digital marketing with hands-on workshops and expert guidance.',
        category: 'professional',
        subCategory: 'workshop',
        organizer: organizer._id,
        organizerName: organizer.name,
        bannerImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
        venue: {
          name: 'Business Hub',
          address: '321 Market Road',
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India',
          zipCode: '411001',
        },
        date: {
          start: new Date('2026-06-05'),
          end: new Date('2026-06-07'),
        },
        ticketTypes: [
          { name: 'General', price: 2500, totalSeats: 100, availableSeats: 100, benefits: ['Workshop access', 'Materials', 'Certificate'] },
          { name: 'Early Bird', price: 2000, totalSeats: 50, availableSeats: 50, benefits: ['Discounted price', 'All materials'], validUntil: new Date('2026-05-05') },
        ],
        totalSeats: 150,
        availableSeats: 150,
        pricing: { min: 2000, max: 2500, currency: 'INR' },
        features: ['Hands-on training', 'Certificate', 'Materials', 'Lunch'],
        tags: ['workshop', 'marketing', 'professional', 'learning'],
        status: 'published',
        isFeatured: false,
      },
      {
        title: 'Food & Wine Festival',
        description: 'Indulge in gourmet food and premium wines from around the world.',
        category: 'social',
        subCategory: 'community',
        organizer: organizer._id,
        organizerName: organizer.name,
        bannerImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
        venue: {
          name: 'Riverside Gardens',
          address: '555 River Road',
          city: 'Goa',
          state: 'Goa',
          country: 'India',
          zipCode: '403001',
        },
        date: {
          start: new Date('2026-08-15'),
          end: new Date('2026-08-16'),
        },
        ticketTypes: [
          { name: 'General', price: 2000, totalSeats: 300, availableSeats: 300, benefits: ['Food tasting', 'Wine tasting'] },
          { name: 'VIP', price: 5000, totalSeats: 50, availableSeats: 50, benefits: ['All tastings', 'Chef meet & greet', 'Premium wines'] },
        ],
        totalSeats: 350,
        availableSeats: 350,
        pricing: { min: 2000, max: 5000, currency: 'INR' },
        features: ['Food', 'Wine', 'Live Music', 'Outdoor'],
        tags: ['food', 'wine', 'festival', 'social'],
        status: 'published',
        isFeatured: true,
      },
      {
        title: 'Startup Networking Mixer',
        description: 'Connect with fellow entrepreneurs, investors, and startup enthusiasts. Great opportunity to pitch your ideas!',
        category: 'social',
        subCategory: 'community',
        organizer: organizer2._id,
        organizerName: organizer2.name,
        bannerImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865',
        venue: {
          name: 'Innovation Hub',
          address: '888 Startup Street',
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          zipCode: '500001',
        },
        date: {
          start: new Date('2026-04-25'),
          end: new Date('2026-04-25'),
        },
        ticketTypes: [
          { name: 'General', price: 500, totalSeats: 150, availableSeats: 150, benefits: ['Networking', 'Refreshments'] },
          { name: 'Student', price: 200, totalSeats: 50, availableSeats: 50, benefits: ['Student discount', 'Networking'] },
        ],
        totalSeats: 200,
        availableSeats: 200,
        pricing: { min: 200, max: 500, currency: 'INR' },
        features: ['Networking', 'Refreshments', 'WiFi'],
        tags: ['networking', 'startup', 'business', 'social'],
        status: 'published',
        isFeatured: false,
      },
      {
        title: 'Yoga & Wellness Retreat',
        description: 'A rejuvenating weekend retreat focusing on yoga, meditation, and holistic wellness.',
        category: 'social',
        subCategory: 'community',
        organizer: organizer2._id,
        organizerName: organizer2.name,
        bannerImage: 'https://images.unsplash.com/photo-1545389336-cf090694435e',
        venue: {
          name: 'Serene Resort',
          address: '999 Wellness Way',
          city: 'Rishikesh',
          state: 'Uttarakhand',
          country: 'India',
          zipCode: '249201',
        },
        date: {
          start: new Date('2026-09-10'),
          end: new Date('2026-09-12'),
        },
        ticketTypes: [
          { name: 'General', price: 8000, totalSeats: 80, availableSeats: 80, benefits: ['Accommodation', 'Meals', 'Yoga sessions'] },
          { name: 'Premium', price: 15000, totalSeats: 20, availableSeats: 20, benefits: ['Private room', 'All meals', 'Spa treatment', 'Personal trainer'] },
        ],
        totalSeats: 100,
        availableSeats: 100,
        pricing: { min: 8000, max: 15000, currency: 'INR' },
        features: ['Accommodation', 'Yoga', 'Meditation', 'Meals', 'Nature'],
        tags: ['wellness', 'yoga', 'retreat', 'health'],
        status: 'published',
        isFeatured: true,
      },
      {
        title: 'AI & Machine Learning Summit',
        description: 'Dive deep into the world of artificial intelligence with hands-on workshops and expert talks.',
        category: 'professional',
        subCategory: 'seminar',
        organizer: organizer._id,
        organizerName: organizer.name,
        bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
        venue: {
          name: 'Tech Park Auditorium',
          address: '111 AI Avenue',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          zipCode: '560002',
        },
        date: {
          start: new Date('2026-05-20'),
          end: new Date('2026-05-21'),
        },
        ticketTypes: [
          { name: 'General', price: 4000, totalSeats: 300, availableSeats: 300, benefits: ['All sessions', 'Materials', 'Lunch'] },
          { name: 'VIP', price: 10000, totalSeats: 50, availableSeats: 50, benefits: ['VIP seating', 'Workshop access', 'Networking dinner', 'Certificate'] },
          { name: 'Early Bird', price: 3000, totalSeats: 100, availableSeats: 100, benefits: ['Discounted price', 'All sessions'], validUntil: new Date('2026-04-20') },
        ],
        totalSeats: 450,
        availableSeats: 450,
        pricing: { min: 3000, max: 10000, currency: 'INR' },
        features: ['Workshops', 'Expert talks', 'Networking', 'Certificate'],
        tags: ['AI', 'machine learning', 'technology', 'professional'],
        status: 'published',
        isFeatured: true,
      },
      {
        title: 'EDM Night - DJ Spectacular',
        description: 'Dance the night away with international DJs and spectacular light shows!',
        category: 'entertainment',
        subCategory: 'concert',
        organizer: organizer._id,
        organizerName: organizer.name,
        bannerImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
        venue: {
          name: 'Open Air Arena',
          address: '222 Party Plaza',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          zipCode: '400002',
        },
        date: {
          start: new Date('2026-04-15'),
          end: new Date('2026-04-15'),
        },
        ticketTypes: [
          { name: 'General', price: 2000, totalSeats: 2000, availableSeats: 2000, benefits: ['Entry', 'Dance floor access'] },
          { name: 'VIP', price: 6000, totalSeats: 200, availableSeats: 200, benefits: ['VIP lounge', 'Premium bar', 'Reserved seating'] },
          { name: 'Early Bird', price: 1500, totalSeats: 500, availableSeats: 500, benefits: ['Discounted entry'], validUntil: new Date('2026-03-15') },
        ],
        totalSeats: 2700,
        availableSeats: 2700,
        pricing: { min: 1500, max: 6000, currency: 'INR' },
        features: ['Live DJ', 'Light show', 'Bar', 'Security'],
        tags: ['EDM', 'music', 'nightlife', 'concert'],
        status: 'published',
        isFeatured: true,
      },
      {
        title: 'Leadership Masterclass',
        description: 'Transform your leadership skills with industry experts and interactive sessions.',
        category: 'professional',
        subCategory: 'seminar',
        organizer: organizer2._id,
        organizerName: organizer2.name,
        bannerImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
        venue: {
          name: 'Executive Center',
          address: '333 Leadership Lane',
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India',
          zipCode: '411002',
        },
        date: {
          start: new Date('2026-07-10'),
          end: new Date('2026-07-11'),
        },
        ticketTypes: [
          { name: 'General', price: 5000, totalSeats: 100, availableSeats: 100, benefits: ['2-day access', 'Materials', 'Certificate'] },
          { name: 'Premium', price: 12000, totalSeats: 30, availableSeats: 30, benefits: ['All access', '1-on-1 coaching session', 'Premium materials'] },
        ],
        totalSeats: 130,
        availableSeats: 130,
        pricing: { min: 5000, max: 12000, currency: 'INR' },
        features: ['Expert speakers', 'Interactive sessions', 'Certificate', 'Networking'],
        tags: ['leadership', 'professional', 'training', 'business'],
        status: 'published',
        isFeatured: false,
      },
    ];

    await Event.insertMany(events);
    console.log('✅ Created sample events');

    // Get the created events for references
    const allEvents = await Event.find();
    const musicFestival = allEvents.find(e => e.title.includes('Summer Music Festival'));
    const techConf = allEvents.find(e => e.title.includes('Tech Conference'));
    const comedyNight = allEvents.find(e => e.title.includes('Stand-Up Comedy'));
    const foodFestival = allEvents.find(e => e.title.includes('Food & Wine'));
    const aiSummit = allEvents.find(e => e.title.includes('AI & Machine Learning'));
    const edmNight = allEvents.find(e => e.title.includes('EDM Night'));

    // Create Bookings with different statuses
    const bookings = [
      {
        user: user._id,
        event: musicFestival._id,
        tickets: [{
          ticketType: 'VIP',
          quantity: 2,
          price: 5000,
          seatNumbers: ['A1', 'A2']
        }],
        totalAmount: 10000,
        discount: 0,
        finalAmount: 10000,
        attendeeInfo: {
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        paymentStatus: 'completed',
        status: 'confirmed',
        qrCode: 'QR-' + Date.now() + '-001',
      },
      {
        user: user._id,
        event: techConf._id,
        tickets: [{
          ticketType: 'General',
          quantity: 1,
          price: 3000,
          seatNumbers: ['B5']
        }],
        totalAmount: 3000,
        discount: 0,
        finalAmount: 3000,
        attendeeInfo: {
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        paymentStatus: 'completed',
        status: 'confirmed',
        qrCode: 'QR-' + Date.now() + '-002',
      },
      {
        user: user2._id,
        event: comedyNight._id,
        tickets: [{
          ticketType: 'General',
          quantity: 2,
          price: 500,
          seatNumbers: ['C10', 'C11']
        }],
        totalAmount: 1000,
        discount: 0,
        finalAmount: 1000,
        attendeeInfo: {
          name: user2.name,
          email: user2.email,
          phone: user2.phone
        },
        paymentStatus: 'completed',
        status: 'confirmed',
        qrCode: 'QR-' + Date.now() + '-003',
      },
      {
        user: user2._id,
        event: foodFestival._id,
        tickets: [{
          ticketType: 'VIP',
          quantity: 1,
          price: 5000,
          seatNumbers: ['D1']
        }],
        totalAmount: 5000,
        discount: 0,
        finalAmount: 5000,
        attendeeInfo: {
          name: user2.name,
          email: user2.email,
          phone: user2.phone
        },
        paymentStatus: 'pending',
        status: 'pending',
      },
      {
        user: user3._id,
        event: musicFestival._id,
        tickets: [{
          ticketType: 'General',
          quantity: 3,
          price: 1500,
          seatNumbers: ['E15', 'E16', 'E17']
        }],
        totalAmount: 4500,
        discount: 0,
        finalAmount: 4500,
        attendeeInfo: {
          name: user3.name,
          email: user3.email,
          phone: user3.phone
        },
        paymentStatus: 'refunded',
        status: 'cancelled',
        cancellationReason: 'User cancelled due to schedule conflict',
        refundAmount: 4500,
        refundStatus: 'processed',
        cancelledAt: new Date('2026-02-12'),
        refundProcessedAt: new Date('2026-02-12'),
      },
      {
        user: user3._id,
        event: aiSummit._id,
        tickets: [{
          ticketType: 'VIP',
          quantity: 1,
          price: 10000,
          seatNumbers: ['F1']
        }],
        totalAmount: 10000,
        discount: 0,
        finalAmount: 10000,
        attendeeInfo: {
          name: user3.name,
          email: user3.email,
          phone: user3.phone
        },
        paymentStatus: 'completed',
        status: 'confirmed',
        qrCode: 'QR-' + Date.now() + '-004',
      },
    ];

    const createdBookings = await Booking.create(bookings);
    console.log('✅ Created sample bookings with various statuses (Confirmed, Pending, Cancelled, Refunded)');

    // Create Payments
    const payments = [
      {
        user: user._id,
        booking: createdBookings[0]._id,
        event: musicFestival._id,
        amount: 10000,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        transactionId: 'TXN-' + Date.now() + '-001',
        paymentDate: new Date('2026-03-01'),
        paymentGateway: 'razorpay',
        currency: 'INR',
      },
      {
        user: user._id,
        booking: createdBookings[1]._id,
        event: techConf._id,
        amount: 3000,
        paymentMethod: 'upi',
        paymentStatus: 'completed',
        transactionId: 'TXN-' + Date.now() + '-002',
        paymentDate: new Date('2026-02-15'),
        paymentGateway: 'razorpay',
        currency: 'INR',
      },
      {
        user: user2._id,
        booking: createdBookings[2]._id,
        event: comedyNight._id,
        amount: 1000,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        transactionId: 'TXN-' + Date.now() + '-003',
        paymentDate: new Date('2026-02-20'),
        paymentGateway: 'stripe',
        currency: 'INR',
      },
      {
        user: user2._id,
        booking: createdBookings[3]._id,
        event: foodFestival._id,
        amount: 5000,
        paymentMethod: 'card',
        paymentStatus: 'pending',
        transactionId: 'TXN-' + Date.now() + '-004',
        paymentDate: new Date('2026-03-02'),
        paymentGateway: 'razorpay',
        currency: 'INR',
      },
      {
        user: user3._id,
        booking: createdBookings[4]._id,
        event: musicFestival._id,
        amount: 4500,
        paymentMethod: 'upi',
        paymentStatus: 'refunded',
        transactionId: 'TXN-' + Date.now() + '-005',
        paymentDate: new Date('2026-02-10'),
        refundDate: new Date('2026-02-12'),
        paymentGateway: 'razorpay',
        currency: 'INR',
      },
      {
        user: user3._id,
        booking: createdBookings[5]._id,
        event: aiSummit._id,
        amount: 10000,
        paymentMethod: 'card',
        paymentStatus: 'completed',
        transactionId: 'TXN-' + Date.now() + '-006',
        paymentDate: new Date('2026-03-01'),
        paymentGateway: 'stripe',
        currency: 'INR',
      },
    ];

    await Payment.insertMany(payments);
    console.log('✅ Created payment records with transaction logs');

    // Create Combo Passes with discounts
    const comboPasses = [
      {
        name: 'Entertainment Weekend Pass',
        description: 'Get access to Music Festival and EDM Night at a special bundled price! Save 25% on combined tickets.',
        events: [musicFestival._id, edmNight._id],
        organizer: organizer._id,
        pricing: {
          originalPrice: 3500, // (1500 + 2000)
          discountedPrice: 2625, // 25% off
          discountPercentage: 25,
          currency: 'INR'
        },
        totalPasses: 100,
        soldPasses: 0,
        availablePasses: 100,
        validity: {
          start: new Date('2026-03-01'),
          end: new Date('2026-04-30')
        },
        benefits: ['Access to both events', 'Save 25%', 'Priority entry'],
        termsAndConditions: ['Non-refundable', 'Valid for specified events only', 'Cannot be transferred'],
        isActive: true,
        status: 'active'
      },
      {
        name: 'Tech Professional Bundle',
        description: 'Attend both Tech Conference and AI Summit with this exclusive bundle. Perfect for tech enthusiasts!',
        events: [techConf._id, aiSummit._id],
        organizer: organizer._id,
        pricing: {
          originalPrice: 7000, // (3000 + 4000)
          discountedPrice: 5250, // 25% off
          discountPercentage: 25,
          currency: 'INR'
        },
        totalPasses: 50,
        soldPasses: 0,
        availablePasses: 50,
        validity: {
          start: new Date('2026-03-01'),
          end: new Date('2026-06-30')
        },
        benefits: ['Access to both conferences', 'Save 25%', 'Networking opportunities', 'Combined certificate'],
        termsAndConditions: ['Non-refundable', 'Must attend both events', 'ID verification required'],
        isActive: true,
        status: 'active'
      },
      {
        name: 'Premium VIP Experience',
        description: 'Ultimate VIP access to Music Festival, Food Festival, and EDM Night. The complete experience!',
        events: [musicFestival._id, foodFestival._id, edmNight._id],
        organizer: organizer._id,
        pricing: {
          originalPrice: 16000, // (5000 + 5000 + 6000)
          discountedPrice: 11200, // 30% off
          discountPercentage: 30,
          currency: 'INR'
        },
        totalPasses: 25,
        soldPasses: 0,
        availablePasses: 25,
        validity: {
          start: new Date('2026-03-01'),
          end: new Date('2026-08-31')
        },
        benefits: ['VIP access to all 3 events', 'Save 30%', 'All VIP benefits', 'Exclusive lounge access', 'Complimentary food & drinks'],
        termsAndConditions: ['Limited availability', 'Non-refundable', 'VIP wristband provided', 'Valid ID required'],
        isActive: true,
        status: 'active'
      },
    ];

    await ComboPass.insertMany(comboPasses);
    console.log('✅ Created combo passes with automatic discounts');

    // Create Waiting List entries for sold-out comedy show
    const waitingListEntries = [
      {
        user: user._id,
        event: comedyNight._id,
        ticketType: 'General',
        quantity: 2,
        position: 1,
        status: 'waiting',
        metadata: {
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone
        }
      },
      {
        user: user2._id,
        event: comedyNight._id,
        ticketType: 'Premium',
        quantity: 1,
        position: 2,
        status: 'waiting',
        metadata: {
          userName: user2.name,
          userEmail: user2.email,
          userPhone: user2.phone
        }
      },
      {
        user: user3._id,
        event: comedyNight._id,
        ticketType: 'General',
        quantity: 3,
        position: 3,
        status: 'waiting',
        metadata: {
          userName: user3.name,
          userEmail: user3.email,
          userPhone: user3.phone
        }
      },
    ];

    await WaitingList.insertMany(waitingListEntries);
    console.log('✅ Created waiting list entries for sold-out event');

    // Create Reviews
    const reviews = [
      {
        user: user._id,
        userName: user.name,
        event: musicFestival._id,
        booking: createdBookings[0]._id,
        rating: 5,
        comment: 'Absolutely amazing experience! The artists were fantastic and the venue was perfect. Will definitely attend next year!',
        createdAt: new Date('2026-03-02'),
      },
      {
        user: user._id,
        event: techConf._id,
        booking: createdBookings[1]._id,
        rating: 4,
        comment: 'Great conference with insightful sessions. The networking opportunities were excellent!',
        createdAt: new Date('2026-02-16'),
      },
      {
        user: user2._id,
        userName: user2.name,
        event: comedyNight._id,
        booking: createdBookings[2]._id,
        rating: 5,
        comment: 'Laughed so hard! The comedians were hilarious. Best comedy night I\'ve attended!',
        createdAt: new Date('2026-02-21'),
      },
      {
        user: user3._id,
        userName: user3.name,
        event: aiSummit._id,
        booking: createdBookings[5]._id,
        rating: 5,
        comment: 'Excellent content and world-class speakers. Learned a lot about the latest AI trends!',
        createdAt: new Date('2026-03-02'),
      },
    ];

    await Review.insertMany(reviews);
    console.log('✅ Created event reviews');

    console.log('\n🎉 DATABASE SEEDED SUCCESSFULLY!\n');
    console.log('=' .repeat(80));
    console.log('📊 SEEDED DATA SUMMARY:');
    console.log('=' .repeat(80));
    console.log(`👥 Users: 7 (1 Admin, 2 Organizers, 4 Regular Users)`);
    console.log(`🎫 Events: ${allEvents.length} (Including sold-out event for waiting list demo)`);
    console.log(`📋 Bookings: ${createdBookings.length} (Confirmed, Pending, Cancelled, Refunded)`);
    console.log(`💳 Payments: ${payments.length} (Various payment methods and statuses)`);
    console.log(`🎁 Combo Passes: ${comboPasses.length} (With 25-30% discounts)`);
    console.log(`⏳ Waiting List: ${waitingListEntries.length} entries`);
    console.log(`⭐ Reviews: ${reviews.length} ratings`);
    console.log('=' .repeat(80));
    
    console.log('\n📝 DEMO CREDENTIALS:');
    console.log('─'.repeat(80));
    console.log('👑 Admin:     admin@eventbooking.com / Admin@123');
    console.log('🎪 Organizer: organizer@eventbooking.com / Organizer@123');
    console.log('👤 User:      user@eventbooking.com / User@123');
    console.log('─'.repeat(80));
    
    console.log('\n✨ ALL FEATURES IMPLEMENTED:');
    console.log('─'.repeat(80));
    console.log('✅ Individual event booking with multiple ticket types');
    console.log('✅ Combo passes with automatic discounts (25-30% off)');
    console.log('✅ Real-time seat availability tracking');
    console.log('✅ Waiting list for sold-out events');
    console.log('✅ Multiple payment statuses (Completed, Pending, Refunded)');
    console.log('✅ QR code generation for confirmed bookings');
    console.log('✅ PDF invoice & text receipt generation');
    console.log('✅ Automated email notifications (6 types)');
    console.log('✅ Transaction logs and booking history');
    console.log('✅ User reviews and ratings');
    console.log('✅ Role-based dashboards (Admin/Organizer/User)');
    console.log('✅ Secure payment integration (Razorpay/Stripe + Demo mode)');
    console.log('✅ AI personalized recommendations');
    console.log('✅ AI dynamic pricing suggestions');
    console.log('✅ AI fraud detection');
    console.log('✅ Search & filter (category, date, location, price, popularity)');
    console.log('✅ Event management (create, edit, delete)');
    console.log('✅ Refund processing with cancellation policies');
    console.log('✅ Security features (encryption, session timeout, authorization)');
    console.log('✅ Analytics dashboards (sales, revenue, attendance)');
    console.log('─'.repeat(80));
    
    console.log('\n🚀 READY FOR SCREEN RECORDING!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedData();
