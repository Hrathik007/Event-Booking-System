const express = require('express');
const {
  joinWaitingList,
  getMyWaitingList,
  getEventWaitingList,
  notifyNextInLine,
  removeFromWaitingList,
  markAsConverted
} = require('../controllers/waitingListController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', joinWaitingList);
router.get('/my-entries', getMyWaitingList);
router.get('/event/:eventId', authorize('organizer', 'admin'), getEventWaitingList);
router.post('/notify/:eventId', authorize('organizer', 'admin'), notifyNextInLine);
router.delete('/:id', removeFromWaitingList);
router.put('/:id/converted', markAsConverted);

module.exports = router;
