const express = require('express');
const {
  createOrder,
  verifyPayment,
  processRefund,
  getPayment,
  getMyPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(protect);

router.post('/create-order', paymentLimiter, createOrder);
router.post('/verify', verifyPayment);
router.get('/', getMyPayments);
router.get('/:id', getPayment);
router.post('/refund', authorize('admin'), processRefund);

module.exports = router;
