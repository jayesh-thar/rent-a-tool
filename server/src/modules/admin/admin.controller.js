const User = require('../auth/user.model');
const Tool = require('../tools/tool.model');
const Booking = require('../bookings/booking.model');

// GET /api/v1/admin/dashboard
// Computes summary metrics for total users, listings, active, and overdue rentals.
async function getStats(req, res, next) {
  try {
    const totalUsers = await User.countDocuments();
    const totalTools = await Tool.countDocuments();
    const activeRentals = await Booking.countDocuments({ bookingStatus: 'active' });
    
    // An active rental is overdue if its endDate is in the past
    const overdueRentals = await Booking.countDocuments({
      bookingStatus: 'active',
      endDate: { $lt: new Date() },
    });

    res.json({
      stats: {
        totalUsers,
        totalTools,
        activeRentals,
        overdueRentals,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/admin/users
// Lists all registered users for administration.
async function getUsers(req, res, next) {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/admin/users/:id/status
// Toggles blocking and unblocking accounts. Prevents self-blocking.
async function toggleUserBlock(req, res, next) {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user.userId) {
      return res.status(400).json({ message: 'Lenders cannot block their own admin account' });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: `User ${user.fullName} has been ${user.isBlocked ? 'blocked' : 'unblocked'}`,
      user,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
  getUsers,
  toggleUserBlock,
};
