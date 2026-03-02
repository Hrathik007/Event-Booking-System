const express = require('express');
const {
  getAllUsers,
  updateUserRole,
  deactivateUser,
  getAnalytics,
  approveRefund,
  getAllEvents
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/deactivate', deactivateUser);
router.get('/analytics', getAnalytics);
router.put('/refunds/:id/approve', approveRefund);
router.get('/events', getAllEvents);

module.exports = router;
