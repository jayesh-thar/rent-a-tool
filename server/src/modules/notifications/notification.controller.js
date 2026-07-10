const Notification = require('./notification.model');
const { checkAndNotifyOverdueBookings } = require('../bookings/booking.service');

// Retrieve all notifications for the logged-in user
async function getNotifications(req, res) {
  try {
    // Dynamically scan for overdue bookings first so any newly triggered alerts show up immediately
    await checkAndNotifyOverdueBookings();

    const notifications = await Notification.find({ recipientId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Mark a single notification as read
async function markAsRead(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Mark all notifications for the user as read
async function markAllAsRead(req, res) {
  try {
    await Notification.updateMany(
      { recipientId: req.user.userId, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get the count of unread notifications
async function getUnreadCount(req, res) {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user.userId,
      isRead: false,
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
