const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['General', 'VIP', 'Early Bird', 'Premium', 'Student']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 0
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  benefits: [String],
  validUntil: Date
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide event description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['entertainment', 'professional', 'social']
  },
  subCategory: {
    type: String,
    required: true,
    enum: [
      'concert', 'standup', 'festival', 'theater',
      'conference', 'seminar', 'workshop', 'webinar',
      'wedding', 'party', 'community', 'sports', 'cultural'
    ]
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizerName: String,
  images: [{
    url: String,
    alt: String
  }],
  bannerImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'
  },
  venue: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  date: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  ticketTypes: [ticketTypeSchema],
  totalSeats: {
    type: Number,
    required: true
  },
  availableSeats: {
    type: Number,
    required: true
  },
  pricing: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  features: [String],
  tags: [String],
  ageRestriction: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  },
  waitingList: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: Date
  }],
  refundPolicy: {
    type: String,
    default: 'full'
  },
  seatLayout: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  specialOffer: {
    enabled: Boolean,
    discount: Number,
    validUntil: Date,
    description: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reviews
eventSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'event',
  justOne: false
});

// Index for search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ 'venue.city': 1, 'date.start': 1 });
eventSchema.index({ category: 1, subCategory: 1 });

module.exports = mongoose.model('Event', eventSchema);
