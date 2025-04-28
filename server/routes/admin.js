const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateAdmin } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// GET /api/admin/users - Get all users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    console.log('Fetching users...');
    const users = await User.find({})
      .select('-password')  // Exclude password
      .sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/admin/users/:id - Update user status
router.put('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status', error: error.message });
  }
});

// PUT /api/admin/users/:id/approve - Approve employer
router.put('/users/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    console.log('Approving employer with ID:', req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const user = await User.findById(req.params.id);
    console.log('Found user:', user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role.toLowerCase() !== 'employer') {
      return res.status(400).json({ message: 'User is not an employer' });
    }

    user.isApproved = true;
    await user.save();

    const updatedUser = await User.findById(req.params.id).select('-password');
    console.log('User approved successfully:', updatedUser);

    res.json({
      success: true,
      message: 'Employer approved successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error approving employer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 