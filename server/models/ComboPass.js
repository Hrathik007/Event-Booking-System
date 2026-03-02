const mongoose = require('mongoose');

const comboPassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide combo pass name'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pricing: {
    originalPrice: {
      type: Number,
      required: true
    },
    discountedPrice: {
      type: Number,
      required: true
    },
    discountPercentage: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  validity: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  totalPasses: {
    type: Number,
    required: true,
    min: 1
  },
  soldPasses: {
    type: Number,
    default: 0
  },
  availablePasses: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  benefits: [String],
  termsAndConditions: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-calculate discount percentage
comboPassSchema.pre('save', function(next) {
  if (this.pricing.originalPrice && this.pricing.discountedPrice) {
    this.pricing.discountPercentage = Math.round(
      ((this.pricing.originalPrice - this.pricing.discountedPrice) / this.pricing.originalPrice) * 100
    );
  }
  next();
});

// Update availability
comboPassSchema.methods.updateAvailability = function() {
  this.availablePasses = this.totalPasses - this.soldPasses;
  return this.save();
};

module.exports = mongoose.model('ComboPass', comboPassSchema);
