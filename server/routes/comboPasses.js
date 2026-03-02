const express = require('express');
const {
  getComboPasses,
  getComboPass,
  createComboPass,
  purchaseComboPass,
  updateComboPass,
  deleteComboPass
} = require('../controllers/comboPassController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getComboPasses)
  .post(protect, authorize('organizer', 'admin'), createComboPass);

router.route('/:id')
  .get(getComboPass)
  .put(protect, authorize('organizer', 'admin'), updateComboPass)
  .delete(protect, authorize('organizer', 'admin'), deleteComboPass);

router.post('/:id/purchase', protect, purchaseComboPass);

module.exports = router;
