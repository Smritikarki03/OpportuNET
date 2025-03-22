const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// POST a new job
router.post('/', async (req, res) => {
  const {
    title,
    description,
    requirements,
    salary,
    location,
    jobType,
    experienceLevel,
    noOfPositions,
    company,
  } = req.body;

  try {
    const newJob = new Job({
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      noOfPositions,
      company,
      postedBy: req.user ? req.user._id : null, // Optional: If you have user authentication
    });

    await newJob.save();
    res.status(201).json({ message: 'Job posted successfully', job: newJob });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Error posting job', error: error.message });
  }
});

module.exports = router;