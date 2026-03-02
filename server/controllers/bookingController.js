const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const QRCode = require('qrcode');
const { sendBookingConfirmation, sendCancellationEmail } = require('../utils/email');
const { sendBookingConfirmationSMS, sendCancellationSMS } = require('../utils/sms');
const { generateInvoicePDF, generateReceiptText } = require('../utils/invoice');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { eventId, tickets, attendeeInfo } = req.body;

    // Get event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is published
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Event is not available for booking'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    let discount = 0;

    for (const ticket of tickets) {
      const eventTicket = event.ticketTypes.find(t => t.name === ticket.ticketType);
      
      if (!eventTicket) {
        return res.status(400).json({
          success: false,
          message: `Ticket type ${ticket.ticketType} not found`
        });
      }

      if (eventTicket.availableSeats < ticket.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough seats available for ${ticket.ticketType}`
        });
      }

      totalAmount += eventTicket.price * ticket.quantity;
    }

    // Apply discount if special offer exists
    if (event.specialOffer?.enabled && event.specialOffer.validUntil > new Date()) {
      discount = (totalAmount * event.specialOffer.discount) / 100;
    }

    const finalAmount = totalAmount - discount;

    // Create booking
    const booking = await Booking.create({
      user: req.user._id || req.user.id,
      event: eventId,
      tickets,
      totalAmount,
      discount,
      finalAmount,
      attendeeInfo: attendeeInfo || {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone
      },
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirm booking after payment
// @route   PUT /api/bookings/:id/confirm
// @access  Private
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update event seat availability
    const event = booking.event;
    
    for (const ticket of booking.tickets) {
      const eventTicket = event.ticketTypes.find(t => t.name === ticket.ticketType);
      eventTicket.availableSeats -= ticket.quantity;
    }

    event.availableSeats = event.ticketTypes.reduce((sum, t) => sum + t.availableSeats, 0);
    event.bookingCount += 1;
    event.revenue += booking.finalAmount;
    
    await event.save();

    // Generate QR code
    const qrData = {
      bookingId: booking.bookingId,
      eventId: booking.event._id,
      userId: booking.user._id,
      timestamp: Date.now()
    };

    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    
    // Update booking
    booking.status = 'confirmed';
    booking.qrCode = qrCode;
    booking.emailSent = true;
    booking.smsSent = true;
    
    await booking.save();

    // Send confirmation email and SMS (async)
    sendBookingConfirmation(booking).catch(err => console.error('Email error:', err));
    sendBookingConfirmationSMS(booking).catch(err => console.error('SMS error:', err));

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { user: req.user._id || req.user.id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('event', 'title bannerImage date venue')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user', '_id name email phone')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user owns booking or is admin
    const bookingUserId = booking.user?._id?.toString() || booking.user?.toString();
    const currentUserId = req.user?._id?.toString() || req.user?.id?.toString();
    
    if (bookingUserId !== currentUserId && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user owns booking or is admin
    const bookingUserId = booking.user?._id?.toString() || booking.user?.toString();
    const currentUserId = req.user?._id?.toString() || req.user?.id?.toString();
    
    if (bookingUserId !== currentUserId && req.user?.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking already cancelled'
      });
    }

    // Calculate refund based on policy
    let refundAmount = 0;
    const eventDate = new Date(booking.event.date.start);
    const now = new Date();
    const daysUntilEvent = (eventDate - now) / (1000 * 60 * 60 * 24);

    if (daysUntilEvent > 7) {
      refundAmount = booking.finalAmount; // 100% refund
    } else if (daysUntilEvent > 3) {
      refundAmount = booking.finalAmount * 0.5; // 50% refund
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason;
    booking.refundAmount = refundAmount;
    booking.refundStatus = refundAmount > 0 ? 'requested' : 'none';

    await booking.save();

    // Restore event seats
    const event = booking.event;
    for (const ticket of booking.tickets) {
      const eventTicket = event.ticketTypes.find(t => t.name === ticket.ticketType);
      eventTicket.availableSeats += ticket.quantity;
    }
    event.availableSeats = event.ticketTypes.reduce((sum, t) => sum + t.availableSeats, 0);
    await event.save();

    // Send cancellation notifications (async)
    sendCancellationEmail(booking).catch(err => console.error('Email error:', err));
    sendCancellationSMS(booking).catch(err => console.error('SMS error:', err));

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download QR code
// @route   GET /api/bookings/:id/qrcode
// @access  Private
exports.downloadQRCode = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Robust user ID comparison - allow booking owner or admin
    const bookingUserId = booking.user?._id?.toString() || booking.user?.toString();
    const currentUserId = req.user?._id?.toString() || req.user?.id?.toString();
    
    if (bookingUserId !== currentUserId && req.user?.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    if (!booking.qrCode) {
      return res.status(400).json({
        success: false,
        message: 'QR code not available'
      });
    }

    res.status(200).json({
      success: true,
      qrCode: booking.qrCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Download invoice PDF
// @route   GET /api/bookings/:id/invoice
// @access  Private
exports.downloadInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const bookingUserId = booking.user?._id?.toString() || booking.user?.id?.toString();
    const currentUserId = req.user?._id?.toString() || req.user?.id?.toString();
    
    if (bookingUserId !== currentUserId && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(booking, booking.event, booking.user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${booking.bookingId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice: ' + error.message
    });
  }
};

// @desc    Download receipt
// @route   GET /api/bookings/:id/receipt
// @access  Private
exports.downloadReceipt = async (req, res) => {
  try {
    const booking =await Booking.findById(req.params.id)
      .populate('event');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const bookingUserId = booking.user?.toString();
    const currentUserId = req.user?._id?.toString() || req.user?.id?.toString();
    
    if (bookingUserId !== currentUserId && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Generate receipt
    const receiptText = generateReceiptText(booking, booking.event);

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${booking.bookingId}.txt`);
    res.send(receiptText);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
