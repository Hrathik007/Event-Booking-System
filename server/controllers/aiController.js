const Event = require('../models/Event');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Payment = require('../models/Payment');

// Simple AI recommendation engine based on user interests and booking history
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('bookingHistory');

    // Get user's interests
    const interests = user.interests || [];
    
    // Get user's past bookings to understand preferences
    const pastBookings = await Booking.find({ user: req.user.id, status: 'confirmed' })
      .populate('event')
      .limit(10);

    // Extract categories from past bookings
    const bookedCategories = pastBookings.map(b => b.event.category);
    const bookedSubCategories = pastBookings.map(b => b.event.subCategory);

    // Build recommendation query
    let query = {
      status: 'published',
      'date.start': { $gte: new Date() }
    };

    // Prioritize events matching user interests or past booking patterns
    if (interests.length > 0 || bookedCategories.length > 0) {
      query.$or = [
        { subCategory: { $in: [...interests, ...bookedSubCategories] } },
        { category: { $in: bookedCategories } }
      ];
    }

    // Get recommended events
    const recommendations = await Event.find(query)
      .sort({ 'rating.average': -1, bookingCount: -1 })
      .limit(12);

    // Calculate recommendation score (simple algorithm)
    const scoredRecommendations = recommendations.map(event => {
      let score = 0;
      
      // Interest match
      if (interests.includes(event.subCategory)) score += 30;
      if (bookedCategories.includes(event.category)) score += 20;
      
      // Popularity
      score += Math.min(event.bookingCount / 10, 20);
      
      // Rating
      score += event.rating.average * 5;
      
      // Featured boost
      if (event.isFeatured) score += 15;

      return {
        ...event.toObject(),
        recommendationScore: Math.round(score)
      };
    });

    // Sort by score
    scoredRecommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

    res.status(200).json({
      success: true,
      count: scoredRecommendations.length,
      data: scoredRecommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Dynamic pricing suggestion based on demand
exports.getPricingSuggestion = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check authorization
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Calculate demand metrics
    const totalSeats = event.totalSeats;
    const soldSeats = totalSeats - event.availableSeats;
    const occupancyRate = (soldSeats / totalSeats) * 100;

    // Get booking velocity (bookings per day)
    const daysUntilEvent = Math.ceil(
      (new Date(event.date.start) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const bookingsLastWeek = await Booking.countDocuments({
      event: eventId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const bookingVelocity = bookingsLastWeek / 7;

    // AI pricing logic
    let pricingAdvice = {
      currentOccupancy: Math.round(occupancyRate),
      daysUntilEvent,
      bookingVelocity: Math.round(bookingVelocity * 10) / 10,
      recommendation: '',
      suggestedPriceChange: 0
    };

    // High demand scenario
    if (occupancyRate > 80 && daysUntilEvent > 7) {
      pricingAdvice.recommendation = 'High demand detected. Consider increasing prices by 15-20%.';
      pricingAdvice.suggestedPriceChange = 20;
    }
    // Medium demand
    else if (occupancyRate > 50 && occupancyRate <= 80) {
      pricingAdvice.recommendation = 'Steady demand. Maintain current pricing or slight increase of 5-10%.';
      pricingAdvice.suggestedPriceChange = 5;
    }
    // Low demand, event approaching
    else if (occupancyRate < 30 && daysUntilEvent < 7) {
      pricingAdvice.recommendation = 'Low occupancy with event approaching. Consider offering 10-15% discount.';
      pricingAdvice.suggestedPriceChange = -15;
    }
    // Low demand, event far
    else if (occupancyRate < 50 && daysUntilEvent > 14) {
      pricingAdvice.recommendation = 'Early bird special recommended. Offer 5-10% discount to boost sales.';
      pricingAdvice.suggestedPriceChange = -10;
    }
    // Default
    else {
      pricingAdvice.recommendation = 'Normal demand pattern. Maintain current pricing strategy.';
      pricingAdvice.suggestedPriceChange = 0;
    }

    res.status(200).json({
      success: true,
      data: pricingAdvice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Fraud detection for suspicious booking patterns
exports.detectFraud = async (req, res) => {
  try {
    const suspiciousActivities = [];

    // Check for multiple bookings from same IP in short time
    const recentPayments = await Payment.find({
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    });

    const ipMap = {};
    recentPayments.forEach(payment => {
      const ip = payment.metadata?.ip;
      if (ip) {
        ipMap[ip] = (ipMap[ip] || 0) + 1;
      }
    });

    Object.entries(ipMap).forEach(([ip, count]) => {
      if (count > 5) {
        suspiciousActivities.push({
          type: 'Multiple bookings from same IP',
          ip,
          count,
          severity: 'high',
          timestamp: new Date()
        });
      }
    });

    // Check for unusual booking amounts
    const highValueBookings = await Booking.find({
      finalAmount: { $gt: 50000 },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).populate('user', 'name email');

    highValueBookings.forEach(booking => {
      suspiciousActivities.push({
        type: 'High value booking',
        bookingId: booking.bookingId,
        amount: booking.finalAmount,
        user: booking.user.email,
        severity: 'medium',
        timestamp: booking.createdAt
      });
    });

    // Check for rapid cancellations
    const recentCancellations = await Booking.find({
      status: 'cancelled',
      cancelledAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).populate('user', 'name email');

    const userCancellations = {};
    recentCancellations.forEach(booking => {
      const userId = booking.user._id.toString();
      userCancellations[userId] = (userCancellations[userId] || 0) + 1;
    });

    Object.entries(userCancellations).forEach(([userId, count]) => {
      if (count > 3) {
        const user = recentCancellations.find(b => b.user._id.toString() === userId)?.user;
        suspiciousActivities.push({
          type: 'Multiple cancellations',
          user: user?.email,
          count,
          severity: 'medium',
          timestamp: new Date()
        });
      }
    });

    res.status(200).json({
      success: true,
      alertCount: suspiciousActivities.length,
      data: suspiciousActivities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
