const express = require('express');
const {
  getRecommendations,
  getPricingSuggestion,
  detectFraud
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/recommendations', getRecommendations);
router.get('/pricing-suggestion/:eventId', authorize('organizer', 'admin'), getPricingSuggestion);
router.get('/fraud-detection', authorize('admin'), detectFraud);

module.exports = router;
