const express = require('express');
const { adminApproveRejectEmployer , getNotifications, markNotificationAsRead } = require('../controllers/adminController');  // Destructure the function correctly
const { authenticateAdmin } = require('../middleware/authMiddleware');  // Ensure this is the correct path

const router = express.Router();

// Admin Routes with authentication
router.post('/approve-reject', authenticateAdmin, adminApproveRejectEmployer);// Route to get all notifications for the admin
router.get('/notifications', authenticateAdmin, getNotifications);

// Route to mark a specific notification as read
router.patch('/notifications/:id', authenticateAdmin, markNotificationAsRead);

module.exports = router;