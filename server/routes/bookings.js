const express = require('express');
const {
  createBooking,
  confirmBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  downloadQRCode,
  downloadInvoice,
  downloadReceipt
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMyBookings)
  .post(bookingLimiter, createBooking);

router.get('/:id', getBooking);
router.put('/:id/confirm', confirmBooking);
router.put('/:id/cancel', cancelBooking);
router.get('/:id/qrcode', downloadQRCode);
router.get('/:id/invoice', downloadInvoice);
router.get('/:id/receipt', downloadReceipt);

module.exports = router;
