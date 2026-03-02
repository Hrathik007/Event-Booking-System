const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// This would typically use a profile/user controller
// For now, keeping it simple with inline handlers

router.get('/profile', async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

module.exports = router;
