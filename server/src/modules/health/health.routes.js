const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Health check endpoint — confirms the API is running, reports MongoDB connection state,
// and returns public counts for tools, community members, and bookings for the landing page.
router.get('/', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

    // Retrieve models dynamically to avoid circular dependencies and ensure they are registered
    const User = mongoose.model('User');
    const Tool = mongoose.model('Tool');
    const Booking = mongoose.model('Booking');

    // Retrieve stats counts asynchronously
    const [totalTools, totalUsers, totalTransactions] = await Promise.all([
      Tool.countDocuments(),
      User.countDocuments(),
      Booking.countDocuments(),
    ]);

    res.json({
      status: 'ok',
      db: dbStatus,
      timestamp: new Date().toISOString(),
      stats: {
        totalTools,
        totalUsers,
        totalTransactions,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
