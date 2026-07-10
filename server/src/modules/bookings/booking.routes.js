const express = require('express');
const bookingController = require('./booking.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = express.Router();

// Apply auth middleware to all booking routes
router.use(authMiddleware);

router.post('/', bookingController.create);
router.get('/borrower', bookingController.listBorrowerBookings);
router.get('/lender', bookingController.listLenderBookings);
router.patch('/:id/status', bookingController.updateStatus);

module.exports = router;
