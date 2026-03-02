const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  tickets: [{
    ticketType: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    seatNumbers: [String]
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  qrCode: {
    type: String
  },
  attendeeInfo: {
    name: String,
    email: String,
    phone: String
  },
  checkInStatus: {
    type: Boolean,
    default: false
  },
  checkInTime: Date,
  cancellationReason: String,
  cancelledAt: Date,
  refundAmount: Number,
  refundStatus: {
    type: String,
    enum: ['none', 'requested', 'approved', 'rejected', 'processed'],
    default: 'none'
  },
  refundProcessedAt: Date,
  comboPass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ComboPass'
  },
  comboPassName: String,
  isCombo: {
    type: Boolean,
    default: false
  },
  comboEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  smsSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate unique booking ID
bookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingId = `BKG-${timestamp}-${random}`;
  }
  next();
});

// Index
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
