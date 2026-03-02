const twilio = require('twilio');

// Initialize Twilio client (or demo mode if credentials not provided)
let client = null;
let DEMO_MODE = !process.env.TWILIO_ACCOUNT_SID || 
                !process.env.TWILIO_AUTH_TOKEN || 
                !process.env.TWILIO_ACCOUNT_SID.startsWith('AC') ||
                process.env.TWILIO_ACCOUNT_SID === 'your_twilio_account_sid';

if (!DEMO_MODE) {
  try {
    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio SMS client initialized');
  } catch (error) {
    console.log('⚠️  Twilio initialization failed, using demo mode');
    DEMO_MODE = true;
  }
} else {
  console.log('📱 SMS Demo Mode: Twilio credentials not configured (messages will be logged to console)');
}

// Helper function to format phone number
const formatPhoneNumber = (phone) => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present (default to India +91)
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    return `+91${cleaned}`;
  } else if (cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  return `+${cleaned}`;
};

// Send booking confirmation SMS
exports.sendBookingConfirmationSMS = async (booking) => {
  try {
    const phone = formatPhoneNumber(booking.attendeeInfo.phone);
    const message = `
🎫 Booking Confirmed!
Event: ${booking.event.title}
Booking ID: ${booking.bookingId}
Date: ${new Date(booking.event.date.start).toLocaleDateString()}
Amount: ₹${booking.finalAmount}
Download ticket: ${process.env.CLIENT_URL}/dashboard
- Event Booking System
    `.trim();

    if (DEMO_MODE) {
      console.log('📱 [SMS DEMO MODE] Would send to:', phone);
      console.log('Message:', message);
      return { success: true, demo: true };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    console.log('✅ SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send cancellation SMS
exports.sendCancellationSMS = async (booking) => {
  try {
    const phone = formatPhoneNumber(booking.attendeeInfo.phone);
    const message = `
Booking Cancelled
Booking ID: ${booking.bookingId}
Event: ${booking.event.title}
${booking.refundAmount > 0 ? `Refund: ₹${booking.refundAmount} (5-7 days)` : ''}
- Event Booking System
    `.trim();

    if (DEMO_MODE) {
      console.log('📱 [SMS DEMO MODE] Would send to:', phone);
      console.log('Message:', message);
      return { success: true, demo: true };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    console.log('✅ SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send event reminder SMS
exports.sendEventReminderSMS = async (booking, event) => {
  try {
    const phone = formatPhoneNumber(booking.attendeeInfo.phone);
    const message = `
⏰ Event Tomorrow!
${event.title}
Date: ${new Date(event.date.start).toLocaleString()}
Venue: ${event.venue?.name || 'Check your ticket'}
Arrive 30 mins early. Bring your QR code & ID.
- Event Booking System
    `.trim();

    if (DEMO_MODE) {
      console.log('📱 [SMS DEMO MODE] Would send to:', phone);
      console.log('Message:', message);
      return { success: true, demo: true };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    console.log('✅ SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send waiting list notification SMS
exports.sendWaitingListSMS = async (waitingListEntry, event) => {
  try {
    const phone = formatPhoneNumber(waitingListEntry.metadata.userPhone);
    const message = `
🎫 Tickets Available!
${event.title}
${waitingListEntry.ticketType} tickets are now available.
Book within 24 hours: ${process.env.CLIENT_URL}/events/${event._id}
- Event Booking System
    `.trim();

    if (DEMO_MODE) {
      console.log('📱 [SMS DEMO MODE] Would send to:', phone);
      console.log('Message:', message);
      return { success: true, demo: true };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    console.log('✅ SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send payment confirmation SMS
exports.sendPaymentSuccessSMS = async (payment, booking) => {
  try {
    const phone = formatPhoneNumber(booking.attendeeInfo.phone);
    const message = `
✅ Payment Successful
Amount: ₹${payment.amount}
Transaction ID: ${payment.transactionId}
Booking ID: ${booking.bookingId}
Your ticket is ready to download.
- Event Booking System
    `.trim();

    if (DEMO_MODE) {
      console.log('📱 [SMS DEMO MODE] Would send to:', phone);
      console.log('Message:', message);
      return { success: true, demo: true };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    console.log('✅ SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

// Send refund confirmation SMS
exports.sendRefundSMS = async (booking, refundAmount) => {
  try {
    const phone = formatPhoneNumber(booking.attendeeInfo.phone);
    const message = `
✅ Refund Processed
Booking ID: ${booking.bookingId}
Amount: ₹${refundAmount}
Will be credited in 5-7 business days to your original payment method.
- Event Booking System
    `.trim();

    if (DEMO_MODE) {
      console.log('📱 [SMS DEMO MODE] Would send to:', phone);
      console.log('Message:', message);
      return { success: true, demo: true };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    console.log('✅ SMS sent:', result.sid);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('❌ SMS error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = exports;
