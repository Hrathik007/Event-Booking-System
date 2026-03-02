const PDFDocument = require('pdfkit');

exports.generateInvoicePDF = (booking, event, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(24)
        .fillColor('#4F46E5')
        .text('INVOICE', { align: 'right' })
        .moveDown(0.5);

      // Company Info
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text('Event Booking System', 50, 50)
        .fontSize(10)
        .fillColor('#666666')
        .text('123 Event Street', 50, 68)
        .text('City, State 12345', 50, 82)
        .text('support@eventbooking.com', 50, 96)
        .moveDown(2);

      // Invoice Details (Right side)
      const invoiceY = 120;
      doc
        .fontSize(10)
        .fillColor('#666666')
        .text(`Invoice #: ${booking.bookingId}`, 350, invoiceY)
        .text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, 350, invoiceY + 14)
        .text(`Status: ${booking.status.toUpperCase()}`, 350, invoiceY + 28)
        .moveDown(2);

      // Customer Info
      doc
        .fontSize(12)
        .fillColor('#000000')
        .text('Bill To:', 50, 180)
        .fontSize(10)
        .fillColor('#666666')
        .text(user.name || booking.attendeeInfo.name, 50, 198)
        .text(user.email || booking.attendeeInfo.email, 50, 212)
        .text(user.phone || booking.attendeeInfo.phone || 'N/A', 50, 226)
        .moveDown(3);

      // Event Details Box
      const boxY = 260;
      doc
        .rect(50, boxY, 495, 80)
        .fillAndStroke('#F3F4F6', '#E5E7EB');

      doc
        .fillColor('#000000')
        .fontSize(14)
        .text('Event Details', 60, boxY + 10)
        .fontSize(11)
        .fillColor('#666666')
        .text(`Event: ${event.title}`, 60, boxY + 30)
        .text(`Date: ${new Date(event.date.start).toLocaleString()}`, 60, boxY + 45)
        .text(`Venue: ${event.venue?.name || 'TBA'} - ${event.venue?.city || ''}`, 60, boxY + 60);

      // Ticket Details Table
      const tableTop = boxY + 110;
      doc
        .fontSize(11)
        .fillColor('#000000')
        .text('Ticket Type', 50, tableTop)
        .text('Quantity', 250, tableTop)
        .text('Price', 350, tableTop)
        .text('Total', 450, tableTop, { align: 'right' });

      // Table line
      doc
        .moveTo(50, tableTop + 18)
        .lineTo(545, tableTop + 18)
        .stroke('#E5E7EB');

      let y = tableTop + 30;
      booking.tickets.forEach((ticket) => {
        const lineTotal = ticket.price * ticket.quantity;
        
        doc
          .fontSize(10)
          .fillColor('#666666')
          .text(ticket.ticketType, 50, y)
          .text(ticket.quantity.toString(), 250, y)
          .text(`₹${ticket.price.toLocaleString()}`, 350, y)
          .text(`₹${lineTotal.toLocaleString()}`, 450, y, { align: 'right' });

        // Seat numbers if any
        if (ticket.seatNumbers && ticket.seatNumbers.length > 0) {
          y += 15;
          doc
            .fontSize(9)
            .fillColor('#999999')
            .text(`Seats: ${ticket.seatNumbers.join(', ')}`, 50, y);
        }

        y += 30;
      });

      // Totals Box
      const totalsY = y + 20;
      doc
        .moveTo(350, totalsY)
        .lineTo(545, totalsY)
        .stroke('#E5E7EB');

      doc
        .fontSize(10)
        .fillColor('#666666')
        .text('Subtotal:', 350, totalsY + 10)
        .text(`₹${booking.totalAmount.toLocaleString()}`, 450, totalsY + 10, { align: 'right' });

      if (booking.discount > 0) {
        doc
          .text('Discount:', 350, totalsY + 25)
          .text(`-₹${booking.discount.toLocaleString()}`, 450, totalsY + 25, { align: 'right' });
      }

      doc
        .fontSize(12)
        .fillColor('#000000')
        .text('Total Amount:', 350, totalsY + (booking.discount > 0 ? 45 : 30))
        .fontSize(14)
        .fillColor('#10B981')
        .text(`₹${booking.finalAmount.toLocaleString()}`, 450, totalsY + (booking.discount > 0 ? 45 : 30), { 
          align: 'right' 
        });

      // Payment Status
      const statusY = totalsY + 80;
      const statusColor = booking.paymentStatus === 'completed' ? '#10B981' : 
                         booking.paymentStatus === 'pending' ? '#F59E0B' : '#DC2626';
      
      doc
        .fontSize(11)
        .fillColor('#666666')
        .text('Payment Status:', 350, statusY)
        .fillColor(statusColor)
        .text(booking.paymentStatus.toUpperCase(), 450, statusY, { align: 'right' });

      // Footer
      const footerY = 700;
      doc
        .moveTo(50, footerY)
        .lineTo(545, footerY)
        .stroke('#E5E7EB');

      doc
        .fontSize(9)
        .fillColor('#999999')
        .text('Thank you for your booking!', 50, footerY + 15, { align: 'center', width: 495 })
        .text('For queries, contact: support@eventbooking.com | +91 1234567890', 50, footerY + 30, { 
          align: 'center', 
          width: 495 
        })
        .text('This is a computer-generated invoice and does not require a signature.', 50, footerY + 45, { 
          align: 'center', 
          width: 495 
        });

      // QR Code info
      if (booking.qrCode) {
        doc
          .fontSize(8)
          .fillColor('#666666')
          .text('Scan QR code at venue for entry', 50, footerY + 65, { align: 'center', width: 495 });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Generate simplified receipt
exports.generateReceiptText = (booking, event) => {
  const divider = '='.repeat(50);
  const ticketLines = booking.tickets.map(t => 
    `${t.ticketType} x${t.quantity} @ ₹${t.price} = ₹${t.price * t.quantity}`
  ).join('\n');

  return `
${divider}
          EVENT BOOKING RECEIPT
${divider}

Booking ID: ${booking.bookingId}
Date: ${new Date(booking.createdAt).toLocaleString()}

EVENT DETAILS:
${event.title}
Date: ${new Date(event.date.start).toLocaleString()}
Venue: ${event.venue?.name || 'TBA'}

CUSTOMER:
${booking.attendeeInfo.name}
${booking.attendeeInfo.email}
${booking.attendeeInfo.phone || ''}

TICKETS:
${ticketLines}

Subtotal: ₹${booking.totalAmount}
Discount: -₹${booking.discount || 0}
${divider}
TOTAL PAID: ₹${booking.finalAmount}
${divider}

Payment Status: ${booking.paymentStatus.toUpperCase()}
Booking Status: ${booking.status.toUpperCase()}

${booking.qrCode ? 'QR Code: Show at venue for entry' : ''}

Thank you for booking with us!
Event Booking System
support@eventbooking.com
${divider}
`;
};
