const express = require('express');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('organizer', 'admin'));

// @desc    Get organizer's events
// @route   GET /api/organizer/events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get event analytics
// @route   GET /api/organizer/events/:id/analytics
router.get('/events/:id/analytics', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Get bookings
    const bookings = await Booking.find({ event: req.params.id })
      .populate('user', 'name email');

    // Calculate stats
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const revenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.finalAmount, 0);

    // Ticket type breakdown
    const ticketBreakdown = {};
    bookings.forEach(booking => {
      booking.tickets.forEach(ticket => {
        if (!ticketBreakdown[ticket.ticketType]) {
          ticketBreakdown[ticket.ticketType] = { count: 0, revenue: 0 };
        }
        ticketBreakdown[ticket.ticketType].count += ticket.quantity;
        ticketBreakdown[ticket.ticketType].revenue += ticket.price * ticket.quantity;
      });
    });

    res.status(200).json({
      success: true,
      data: {
        event,
        stats: {
          totalBookings,
          confirmedBookings,
          cancelledBookings,
          revenue,
          occupancyRate: ((event.totalSeats - event.availableSeats) / event.totalSeats * 100).toFixed(2)
        },
        ticketBreakdown,
        recentBookings: bookings.slice(0, 10)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get organizer dashboard stats
// @route   GET /api/organizer/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id });
    const eventIds = events.map(e => e._id);

    const totalEvents = events.length;
    const publishedEvents = events.filter(e => e.status === 'published').length;
    const totalRevenue = events.reduce((sum, e) => sum + (e.revenue || 0), 0);

    const bookings = await Booking.find({ event: { $in: eventIds } });
    const totalBookings = bookings.length;

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        publishedEvents,
        totalBookings,
        totalRevenue,
        recentEvents: events.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
