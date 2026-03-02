const express = require('express');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Create review
// @route   POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { eventId, bookingId, rating, comment, images } = req.body;

    // Check if user has attended the event
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user.id,
      event: eventId,
      status: 'confirmed'
    });

    if (!booking) {
      return res.status(400).json({
        success: false,
        message: 'You must attend the event to leave a review'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: req.user.id,
      event: eventId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this event'
      });
    }

    const review = await Review.create({
      user: req.user.id,
      event: eventId,
      booking: bookingId,
      rating,
      comment,
      images,
      verified: true
    });

    // Update event rating
    const event = await Event.findById(eventId);
    const reviews = await Review.find({ event: eventId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    event.rating.average = avgRating;
    event.rating.count = reviews.length;
    await event.save();

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get event reviews
// @route   GET /api/reviews/event/:eventId
router.get('/event/:eventId', async (req, res) => {
  try {
    const reviews = await Review.find({ event: req.params.eventId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
