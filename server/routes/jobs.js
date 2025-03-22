const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// POST a new job
router.post('/', async (req, res) => {
  console.log('Received POST request to /api/jobs:', req.body);
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
    });

    await newJob.save();
    res.status(201).json({ message: 'Job posted successfully', job: newJob });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Error posting job', error: error.message });
  }
});

// GET all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find(); // Fetch all jobs from the database
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// Test route to confirm the prefix is working
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

module.exports = router;