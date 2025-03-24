const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const Job = require('../models/Job');

router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, requirements, salary, location, jobType, experienceLevel, noOfPositions, company } = req.body;

    // Validate required fields
    if (!title || !description || !requirements || !salary || !location || !jobType || !experienceLevel || !noOfPositions || !company) {
      return res.status(400).json({ message: 'All fields are required, including company.' });
    }

    const job = new Job({
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      noOfPositions,
      company, // Use the company field from the request body
    });

    await job.save();
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Error posting job', error: error.message });
  }
});

router.get('/', async (req, res) => {
  console.log('Received GET request to /api/jobs');
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// GET a job by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching job with ID:', req.params.id); // Log the ID
    const job = await Job.findById(req.params.id);
    console.log('Found job:', job); // Log the result
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
});

module.exports = router;