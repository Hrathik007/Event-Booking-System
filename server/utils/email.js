const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send booking confirmation email
exports.sendBookingConfirmation = async (booking) => {
  try {
    const mailOptions = {
      from: `Event Booking System <${process.env.EMAIL_USER}>`,
      to: booking.attendeeInfo.email,
      subject: `Booking Confirmed - ${booking.event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Booking Confirmed! 🎉</h2>
          <p>Dear ${booking.attendeeInfo.name},</p>
          <p>Your booking has been confirmed successfully!</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Event Details</h3>
            <p><strong>Event:</strong> ${booking.event.title}</p>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            <p><strong>Date:</strong> ${new Date(booking.event.date.start).toLocaleDateString()}</p>
            <p><strong>Venue:</strong> ${booking.event.venue?.name || 'TBA'}</p>
            <p><strong>Total Amount:</strong> ₹${booking.finalAmount}</p>
          </div>

          <p>Please show your QR code at the venue for entry.</p>
          <p>Download your ticket from your dashboard.</p>
          
          <p style="margin-top: 30px;">Thank you for booking with us!</p>
          <p>The Event Booking Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Confirmation email sent');
  } catch (error) {
    console.error('❌ Email error:', error);
  }
};

// Send cancellation email
exports.sendCancellationEmail = async (booking) => {
  try {
    const mailOptions = {
      from: `Event Booking System <${process.env.EMAIL_USER}>`,
      to: booking.attendeeInfo.email,
      subject: `Booking Cancelled - ${booking.event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DC2626;">Booking Cancelled</h2>
          <p>Dear ${booking.attendeeInfo.name},</p>
          <p>Your booking has been cancelled.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            <p><strong>Event:</strong> ${booking.event.title}</p>
            ${booking.refundAmount > 0 ? `<p><strong>Refund Amount:</strong> ₹${booking.refundAmount}</p>` : ''}
          </div>

          ${booking.refundAmount > 0 ? '<p>Your refund will be processed within 5-7 business days.</p>' : ''}
          
          <p>If you have any questions, please contact our support team.</p>
          <p>The Event Booking Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email error:', error);
  }
};

// Send waiting list notification
exports.sendWaitingListNotification = async (waitingListEntry, event) => {
  try {
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const mailOptions = {
      from: `Event Booking System <${process.env.EMAIL_USER}>`,
      to: waitingListEntry.metadata.userEmail,
      subject: `Tickets Available - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Great News! Tickets Available 🎫</h2>
          <p>Dear ${waitingListEntry.metadata.userName},</p>
          <p>Tickets are now available for the event you were waiting for!</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Event Details</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Ticket Type:</strong> ${waitingListEntry.ticketType}</p>
            <p><strong>Quantity:</strong> ${waitingListEntry.quantity}</p>
            <p><strong>Date:</strong> ${new Date(event.date.start).toLocaleDateString()}</p>
          </div>

          <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; border-left: 4px solid #F59E0B;">
            <p style="margin: 0;"><strong>⏰ Hurry! This offer expires at:</strong></p>
            <p style="margin: 5px 0; font-size: 18px; color: #DC2626;">${expiryTime.toLocaleString()}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/events/${event._id}" 
               style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Book Now
            </a>
          </div>
          
          <p style="margin-top: 30px;">The Event Booking Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Waiting list notification sent');
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};

// Send refund confirmation
exports.sendRefundConfirmation = async (booking, refundAmount) => {
  try {
    const mailOptions = {
      from: `Event Booking System <${process.env.EMAIL_USER}>`,
      to: booking.attendeeInfo.email,
      subject: `Refund Processed - ${booking.event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Refund Processed ✅</h2>
          <p>Dear ${booking.attendeeInfo.name},</p>
          <p>Your refund has been processed successfully.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            <p><strong>Event:</strong> ${booking.event.title}</p>
            <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
            <p><strong>Processing Time:</strong> 5-7 business days</p>
          </div>

          <p>The refund will be credited to your original payment method.</p>
          
          <p style="margin-top: 30px;">Thank you!</p>
          <p>The Event Booking Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Refund confirmation sent');
  } catch (error) {
    console.error('❌ Email error:', error);
  }
};

// Send event reminder (24 hours before)
exports.sendEventReminder = async (booking, event) => {
  try {
    const mailOptions = {
      from: `Event Booking System <${process.env.EMAIL_USER}>`,
      to: booking.attendeeInfo.email,
      subject: `Reminder: ${event.title} Tomorrow!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Event Tomorrow! 🎉</h2>
          <p>Dear ${booking.attendeeInfo.name},</p>
          <p>This is a friendly reminder about your upcoming event!</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Event Details</h3>
            <p><strong>Event:</strong> ${event.title}</p>
            <p><strong>Date:</strong> ${new Date(event.date.start).toLocaleString()}</p>
            <p><strong>Venue:</strong> ${event.venue?.name || 'TBA'}</p>
            <p><strong>Address:</strong> ${event.venue?.address || 'TBA'}</p>
          </div>

          <div style="background-color: #DBEAFE; padding: 15px; border-radius: 8px;">
            <p style="margin: 0;"><strong>📌 Important Reminders:</strong></p>
            <ul style="margin: 10px 0;">
              <li>Arrive 30 minutes early</li>
              <li>Bring your ticket QR code</li>
              <li>Carry a valid ID</li>
              ${event.ageRestriction > 0 ? `<li>Age ${event.ageRestriction}+ only</li>` : ''}
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/dashboard" 
               style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Ticket
            </a>
          </div>
          
          <p>Have a great time!</p>
          <p>The Event Booking Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Event reminder sent');
  } catch (error) {
    console.error('❌ Email error:', error);
  }
};

// Send combo pass purchase confirmation
exports.sendComboPassConfirmation = async (user, comboPass, events) => {
  try {
    const eventsList = events.map(e => `<li>${e.title} - ${new Date(e.date.start).toLocaleDateString()}</li>`).join('');
    
    const mailOptions = {
      from: `Event Booking System <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Combo Pass Purchased - ${comboPass.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Combo Pass Confirmed! 🎫</h2>
          <p>Dear ${user.name},</p>
          <p>Your combo pass has been purchased successfully!</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${comboPass.name}</h3>
            <p>${comboPass.description}</p>
            <p><strong>Price:</strong> <span style="text-decoration: line-through; color: #666;">₹${comboPass.pricing.originalPrice}</span> 
               <strong style="color: #10B981; font-size: 20px;">₹${comboPass.pricing.discountedPrice}</strong></p>
            <p><strong>You Saved:</strong> ${comboPass.pricing.discountPercentage}%</p>
            
            <h4>Included Events:</h4>
            <ul>${eventsList}</ul>
          </div>

          <p>Access all events with this single pass. Download your tickets from your dashboard.</p>
          
          <p style="margin-top: 30px;">Thank you for your purchase!</p>
          <p>The Event Booking Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Combo pass confirmation sent');
  } catch (error) {
    console.error('❌ Email error:', error);
  }
};
