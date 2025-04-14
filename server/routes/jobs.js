// routes/jobs.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, async (req, res) => {
  try {
    // Ensure the user is an employer
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Only employers can post jobs.' });
    }

    const { title, description, requirements, salary, location, jobType, experienceLevel, noOfPositions, company } = req.body;

    // Validate required fields
    const requiredFields = ['title', 'description', 'requirements', 'salary', 'location', 'jobType', 'experienceLevel', 'noOfPositions', 'company'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Create the job with userId set to the authenticated user's id
    const jobData = {
      userId: req.user.id,
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experienceLevel,
      noOfPositions,
      company,
      status: 'Active',
      createdAt: new Date(),
      totalApplicants: 0,
    };

    const job = new Job(jobData);
    await job.save();
    console.log(`Job posted successfully by ${req.user.id}:`, job);
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ message: 'Error posting job', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find()
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});
// GET /api/jobs/:id - Get a single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    console.error('Error fetching job by ID:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/jobs/:id - Delete a job by ID
router.delete('/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log('Received DELETE request for job ID:', jobId);
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;