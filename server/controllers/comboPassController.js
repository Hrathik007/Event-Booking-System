const ComboPass = require('../models/ComboPass');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { sendComboPassConfirmation } = require('../utils/email');

// @desc    Get all active combo passes
// @route   GET /api/combo-passes
exports.getComboPasses = async (req, res) => {
  try {
    const comboPasses = await ComboPass.find({
      status: 'active',
      'validity.end': { $gte: new Date() }
    })
      .populate('events', 'title date venue category')
      .populate('organizer', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: comboPasses.length,
      data: comboPasses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single combo pass
// @route   GET /api/combo-passes/:id
exports.getComboPass = async (req, res) => {
  try {
    const comboPass = await ComboPass.findById(req.params.id)
      .populate('events')
      .populate('organizer', 'name email');

    if (!comboPass) {
      return res.status(404).json({
        success: false,
        message: 'Combo pass not found'
      });
    }

    res.status(200).json({
      success: true,
      data: comboPass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create combo pass
// @route   POST /api/combo-passes
exports.createComboPass = async (req, res) => {
  try {
    const {
      name,
      description,
      events,
      originalPrice,
      discountedPrice,
      validityStart,
      validityEnd,
      totalPasses,
      benefits,
      termsAndConditions
    } = req.body;

    // Verify all events exist
    const eventDocs = await Event.find({ _id: { $in: events } });
    if (eventDocs.length !== events.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more events not found'
      });
    }

    // Create combo pass
    const comboPass = await ComboPass.create({
      name,
      description,
      events,
      organizer: req.user.id,
      pricing: {
        originalPrice,
        discountedPrice
      },
      validity: {
        start: validityStart,
        end: validityEnd
      },
      totalPasses,
      availablePasses: totalPasses,
      benefits,
      termsAndConditions
    });

    await comboPass.populate('events', 'title date');

    res.status(201).json({
      success: true,
      data: comboPass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Purchase combo pass
// @route   POST /api/combo-passes/:id/purchase
exports.purchaseComboPass = async (req, res) => {
  try {
    const comboPass = await ComboPass.findById(req.params.id).populate('events');

    if (!comboPass) {
      return res.status(404).json({
        success: false,
        message: 'Combo pass not found'
      });
    }

    // Check availability
    if (comboPass.availablePasses <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Combo pass sold out'
      });
    }

    // Check validity
    const now = new Date();
    if (now < comboPass.validity.start || now > comboPass.validity.end) {
      return res.status(400).json({
        success: false,
        message: 'Combo pass not valid at this time'
      });
    }

    // Create bookings for each event
    const bookings = [];
    for (const event of comboPass.events) {
      const booking = await Booking.create({
        user: req.user.id,
        event: event._id,
        tickets: [{
          ticketType: 'General',
          quantity: 1,
          price: 0 // Price included in combo
        }],
        attendeeInfo: {
          name: req.body.name || req.user.name,
          email: req.body.email || req.user.email,
          phone: req.body.phone || req.user.phone
        },
        totalAmount: 0,
        finalAmount: comboPass.pricing.discountedPrice / comboPass.events.length,
        status: 'confirmed',
        paymentStatus: 'completed',
        comboPass: comboPass._id,
        comboPassName: comboPass.name
      });
      bookings.push(booking);
    }

    // Update combo pass
    comboPass.soldPasses += 1;
    await comboPass.updateAvailability();

    // Send confirmation email
    try {
      await sendComboPassConfirmation(req.user, comboPass, comboPass.events);
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Combo pass purchased successfully',
      data: {
        comboPass,
        bookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update combo pass
// @route   PUT /api/combo-passes/:id
exports.updateComboPass = async (req, res) => {
  try {
    let comboPass = await ComboPass.findById(req.params.id);

    if (!comboPass) {
      return res.status(404).json({
        success: false,
        message: 'Combo pass not found'
      });
    }

    // Check authorization
    if (comboPass.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    comboPass = await ComboPass.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('events');

    res.status(200).json({
      success: true,
      data: comboPass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete combo pass
// @route   DELETE /api/combo-passes/:id
exports.deleteComboPass = async (req, res) => {
  try {
    const comboPass = await ComboPass.findById(req.params.id);

    if (!comboPass) {
      return res.status(404).json({
        success: false,
        message: 'Combo pass not found'
      });
    }

    // Check authorization
    if (comboPass.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await comboPass.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Combo pass deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
