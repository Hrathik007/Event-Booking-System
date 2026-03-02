const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// Check if in demo mode (no real credentials)
const isDemoMode = !process.env.RAZORPAY_KEY_ID || 
                   process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id' ||
                   !process.env.RAZORPAY_KEY_SECRET ||
                   process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_key_secret';

// Initialize Razorpay only if not in demo mode
let razorpay = null;
if (!isDemoMode) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @desc    Create payment order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking belongs to user
    const bookingUserId = booking.user?.toString();
    const currentUserId = req.user?._id?.toString() || req.user?.id?.toString();
    
    if (bookingUserId !== currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    let order;
    
    if (isDemoMode) {
      // DEMO MODE: Create a mock order
      order = {
        id: `order_DEMO${Date.now()}${Math.random().toString(36).substring(7)}`,
        amount: booking.finalAmount * 100,
        currency: 'INR',
        receipt: `receipt_${booking.bookingId}`,
        status: 'created'
      };
    } else {
      // PRODUCTION MODE: Create actual Razorpay order
      const options = {
        amount: booking.finalAmount * 100, // amount in paise
        currency: 'INR',
        receipt: `receipt_${booking.bookingId}`,
      };
      order = await razorpay.orders.create(options);
    }

    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id || req.user.id,
      amount: booking.finalAmount,
      paymentMethod: isDemoMode ? 'demo' : 'razorpay',
      paymentGateway: isDemoMode ? 'demo' : 'razorpay',
      gatewayOrderId: order.id,
      status: 'pending',
      metadata: {
        ip: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(200).json({
      success: true,
      isDemoMode,
      order,
      payment: {
        id: payment._id,
        transactionId: payment.transactionId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      paymentId,
      isDemoPayment
    } = req.body;

    // Update payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (isDemoMode || isDemoPayment) {
      // DEMO MODE: Auto-approve payment
      payment.status = 'completed';
      payment.gatewayPaymentId = razorpay_payment_id || `pay_DEMO${Date.now()}`;
      payment.gatewaySignature = 'demo_signature';
    } else {
      // PRODUCTION MODE: Verify signature
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

      if (razorpay_signature !== expectedSign) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }

      payment.status = 'completed';
      payment.gatewayPaymentId = razorpay_payment_id;
      payment.gatewaySignature = razorpay_signature;
    }
    
    await payment.save();

    // Update booking
    const booking = await Booking.findById(payment.booking);
    booking.payment = payment._id;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      bookingId: booking._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private (Admin)
exports.processRefund = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Process refund via Razorpay
    const refund = await razorpay.payments.refund(payment.gatewayPaymentId, {
      amount: amount * 100, // amount in paise
    });

    // Update payment
    payment.status = 'refunded';
    payment.refund = {
      amount,
      status: 'completed',
      refundId: refund.id,
      processedAt: new Date()
    };
    await payment.save();

    // Update booking
    await Booking.findByIdAndUpdate(payment.booking, {
      refundStatus: 'processed',
      refundProcessedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:id
// @access  Private
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user payments
// @route   GET /api/payments
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('booking')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
