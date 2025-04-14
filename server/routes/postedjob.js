const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Job = require('../models/Job');

// Modify your existing userInfo route
router.get('/userInfo', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert user document to a plain object
    const userData = user.toObject();

    // If the user is an employer, fetch their posted jobs
    if (user.role === 'employer') {
      const postedJobs = await Job.find({ userId: user._id })
        .select('title location salary status company jobType experienceLevel noOfPositions _id')
        .sort({ createdAt: -1 });

      // Add posted jobs to the user data
      userData.postedJobs = postedJobs;
      console.log('Posted jobs fetched:', postedJobs); // Debug log
    }

    console.log('Sending user data:', userData); // Debug log
    res.json(userData);
  } catch (error) {
    console.error('Error in userInfo:', error);
    res.status(500).json({ message: 'Error fetching user information' });
  }
});

module.exports = router;
