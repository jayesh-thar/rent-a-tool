const express = require('express');
const notificationController = require('./notification.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.get('/unread', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
