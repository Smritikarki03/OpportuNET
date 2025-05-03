const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/authMiddleware');

// Get notifications for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('Fetching unread notifications for user:', req.user.id);
    const notifications = await Notification.find({ 
      recipient: req.user.id,
      read: false // Only get unread notifications
    }).sort({ createdAt: -1 });
    console.log('Found unread notifications:', notifications);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Test route to create a notification (temporary)
router.post('/test', authenticate, async (req, res) => {
  try {
    const notification = new Notification({
      recipient: req.user.id,
      message: 'This is a test notification'
    });
    await notification.save();
    console.log('Test notification created:', notification);
    res.json(notification);
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ message: 'Error creating test notification', error: error.message });
  }
});

// Mark a notification as read
router.put('/:notificationId/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

module.exports = router; 