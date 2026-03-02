const mongoose = require('mongoose');

const waitingListSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketType: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  position: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'notified', 'expired', 'converted'],
    default: 'waiting'
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationSentAt: Date,
  notificationExpiryAt: Date,
  contactPreference: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  metadata: {
    userEmail: String,
    userName: String,
    userPhone: String
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
waitingListSchema.index({ event: 1, status: 1, position: 1 });
waitingListSchema.index({ user: 1, event: 1 }, { unique: true });

// Auto-populate user details
waitingListSchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    if (user) {
      this.metadata.userEmail = user.email;
      this.metadata.userName = user.name;
      this.metadata.userPhone = user.phone;
    }
  }
  next();
});

module.exports = mongoose.model('WaitingList', waitingListSchema);
