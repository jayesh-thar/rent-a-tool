const express = require('express');
const Payment = require('./payment.model');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = express.Router();

// GET /api/v1/payments/booking/:bookingId
// Fetches the transaction log ledger entries associated with a rental booking.
// Auth required. Verify that user requesting matches borrower or owner.
router.get('/booking/:bookingId', authMiddleware, async (req, res, next) => {
  try {
    const payments = await Payment.find({ bookingId: req.params.bookingId })
      .sort({ createdAt: 1 });

    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
