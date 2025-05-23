const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const Notification = require('../models/Notification');
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log('Received contact message:', { name, email, message });
    
    const newMsg = new ContactMessage({ name, email, message });
    await newMsg.save();
    console.log('Saved contact message:', newMsg);

    // Find the admin user
    const admin = await User.findOne({ role: 'admin' });
    console.log('Found admin:', admin ? { id: admin._id, name: admin.name } : 'No admin found');
    
    if (!admin) {
      console.error('No admin user found in the database');
      return res.status(201).json({ success: true, message: 'Message sent!' });
    }

    // Create notification for admin
    const notification = await Notification.create({
      message: `New contact message from ${name} (${email}): "${message.substring(0, 50)}..."`,
      recipient: admin._id,
      adminId: admin._id,
      read: false,
      type: 'contact'
    });

    console.log('Created notification:', {
      id: notification._id,
      message: notification.message,
      recipient: notification.recipient,
      adminId: notification.adminId,
      type: notification.type
    });

    res.status(201).json({ success: true, message: 'Message sent!' });
  } catch (err) {
    console.error('Error in contact route:', err);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Contact route is working!' });
});

module.exports = router; 