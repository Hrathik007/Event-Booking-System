const WaitingList = require('../models/WaitingList');
const Event = require('../models/Event');
const { sendWaitingListNotification } = require('../utils/email');
const { sendWaitingListSMS } = require('../utils/sms');

// @desc    Join waiting list
// @route   POST /api/waiting-list
exports.joinWaitingList = async (req, res) => {
  try {
    const { eventId, ticketType, quantity } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user already in waiting list
    const existing = await WaitingList.findOne({
      event: eventId,
      user: req.user.id,
      status: 'waiting'
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already on the waiting list for this event'
      });
    }

    // Calculate position
    const currentWaiting = await WaitingList.countDocuments({
      event: eventId,
      status: 'waiting'
    });

    const waitingEntry = await WaitingList.create({
      event: eventId,
      user: req.user.id,
      ticketType,
      quantity,
      position: currentWaiting + 1
    });

    res.status(201).json({
      success: true,
      data: waitingEntry,
      message: `You are #${waitingEntry.position} on the waiting list`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's waiting list entries
// @route   GET /api/waiting-list/my-entries
exports.getMyWaitingList = async (req, res) => {
  try {
    const entries = await WaitingList.find({
      user: req.user.id,
      status: { $in: ['waiting', 'notified'] }
    })
      .populate('event', 'title date venue')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get waiting list for an event (organizer/admin)
// @route   GET /api/waiting-list/event/:eventId
exports.getEventWaitingList = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

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

    const waitingList = await WaitingList.find({
      event: req.params.eventId,
      status: 'waiting'
    })
      .sort('position')
      .populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      count: waitingList.length,
      data: waitingList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Notify next in waiting list
// @route   POST /api/waiting-list/notify/:eventId
exports.notifyNextInLine = async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const event = await Event.findById(req.params.eventId);

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

    // Get next people in line
    const nextInLine = await WaitingList.find({
      event: req.params.eventId,
      status: 'waiting'
    })
      .sort('position')
      .limit(quantity);

    if (nextInLine.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No one in waiting list'
      });
    }

    // Notify each person
    const notified = [];
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    for (const entry of nextInLine) {
      entry.status = 'notified';
      entry.notificationSent = true;
      entry.notificationSentAt = new Date();
      entry.notificationExpiryAt = expiryTime;
      await entry.save();

      // Send email and SMS notifications
      try {
        await sendWaitingListNotification(entry, event);
        await sendWaitingListSMS(entry, event);
        notified.push(entry);
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: `Notified ${notified.length} person(s)`,
      data: notified
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove from waiting list
// @route   DELETE /api/waiting-list/:id
exports.removeFromWaitingList = async (req, res) => {
  try {
    const entry = await WaitingList.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Waiting list entry not found'
      });
    }

    // Check authorization
    if (entry.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await entry.deleteOne();

    // Update positions of remaining entries
    await WaitingList.updateMany(
      {
        event: entry.event,
        position: { $gt: entry.position },
        status: 'waiting'
      },
      { $inc: { position: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Removed from waiting list'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark as converted (user booked)
// @route   PUT /api/waiting-list/:id/converted
exports.markAsConverted = async (req, res) => {
  try {
    const entry = await WaitingList.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Waiting list entry not found'
      });
    }

    entry.status = 'converted';
    await entry.save();

    res.status(200).json({
      success: true,
      data: entry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
