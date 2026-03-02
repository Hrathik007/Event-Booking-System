const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Get all events with filters
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      city,
      search,
      minPrice,
      maxPrice,
      startDate,
      endDate,
      sort,
      page = 1,
      limit = 12,
      featured
    } = req.query;

    // Build query
    let query = { status: 'published' };

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (city) query['venue.city'] = new RegExp(city, 'i');
    if (featured === 'true') query.isFeatured = true;

    // Price filter
    if (minPrice || maxPrice) {
      query['pricing.min'] = {};
      if (minPrice) query['pricing.min'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.min'].$lte = Number(maxPrice);
    }

    // Date filter
    if (startDate || endDate) {
      query['date.start'] = {};
      if (startDate) query['date.start'].$gte = new Date(startDate);
      if (endDate) query['date.start'].$lte = new Date(endDate);
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sort
    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { 'pricing.min': 1 };
    else if (sort === 'price-high') sortOption = { 'pricing.min': -1 };
    else if (sort === 'date') sortOption = { 'date.start': 1 };
    else if (sort === 'popular') sortOption = { bookingCount: -1 };
    else if (sort === 'rating') sortOption = { 'rating.average': -1 };

    // Pagination
    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email phone')
      .populate('reviews');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer/Admin)
exports.createEvent = async (req, res) => {
  try {
    // Add organizer to req.body
    req.body.organizer = req.user.id;
    req.body.organizerName = req.user.name;

    // Calculate total seats and pricing
    let totalSeats = 0;
    let minPrice = Infinity;
    let maxPrice = 0;

    req.body.ticketTypes.forEach(ticket => {
      totalSeats += ticket.totalSeats;
      ticket.availableSeats = ticket.totalSeats;
      minPrice = Math.min(minPrice, ticket.price);
      maxPrice = Math.max(maxPrice, ticket.price);
    });

    req.body.totalSeats = totalSeats;
    req.body.availableSeats = totalSeats;
    req.body.pricing = { min: minPrice, max: maxPrice };

    const event = await Event.create(req.body);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer/Admin)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Make sure user is event organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer/Admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Make sure user is event organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get featured events
// @route   GET /api/events/featured
// @access  Public
exports.getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({ 
      isFeatured: true, 
      status: 'published',
      'date.start': { $gte: new Date() }
    })
      .populate('organizer', 'name')
      .limit(8)
      .sort({ bookingCount: -1 });

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
};
