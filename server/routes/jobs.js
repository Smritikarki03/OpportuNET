// routes/jobs.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { authenticate } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

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

router.get('/', authenticate, async (req, res) => {
  try {
    console.log('GET /jobs - User:', req.user);
    let query = {};
    
    // If userId is provided in query params, filter by it
    if (req.query.userId) {
      query.userId = req.query.userId;
    }
    // If user is employer, only show their jobs
    else if (req.user && req.user.role === 'employer') {
      query.userId = req.user.id;
    }

    console.log('Job query:', query);
    const jobs = await Job.find(query).sort({ createdAt: -1 });
    console.log(`Found ${jobs.length} jobs for query:`, query);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// GET /api/jobs/:id - Get a single job by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('GET /jobs/:id - Fetching job with ID:', req.params.id);
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid job ID format:', req.params.id);
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      console.log('Job not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Job not found' });
    }
    console.log('Job found:', job);
    res.json(job);
  } catch (err) {
    console.error('Error fetching job by ID:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/jobs/:id - Delete a job by ID
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log('Received DELETE request for job ID:', jobId);
    
    // First check if the job exists and belongs to the user
    const job = await Job.findOne({ _id: jobId, userId: req.user.id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }
    
    await Job.findByIdAndDelete(jobId);
    res.status(200).json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/jobs/:id - Update a job by ID
router.put('/:id', authenticate, async (req, res) => {
  try {
    const jobId = req.params.id;
    const updates = req.body;
    
    console.log('PUT /jobs/:id - Received request');
    console.log('Job ID:', jobId);
    console.log('User ID:', req.user.id);
    console.log('Update data:', updates);
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      console.log('Invalid job ID format:', jobId);
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    // First check if the job exists and belongs to the user
    const job = await Job.findOne({ _id: jobId, userId: req.user.id });
    if (!job) {
      console.log('Job not found or unauthorized. User ID:', req.user.id);
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }
    console.log('Existing job found:', job);

    // Validate required fields
    const requiredFields = ['title', 'description', 'requirements', 'salary', 'location', 'jobType', 'experienceLevel', 'noOfPositions', 'company', 'deadline'];
    const missingFields = requiredFields.filter(field => !updates[field]);
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate deadline is not in the past
    const deadlineDate = new Date(updates.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadlineDate < today) {
      console.log('Invalid deadline - date is in the past:', updates.deadline);
      return res.status(400).json({ message: 'Deadline cannot be in the past' });
    }

    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { 
        ...updates,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedJob) {
      console.log('Failed to update job:', jobId);
      return res.status(500).json({ message: 'Failed to update job' });
    }

    console.log('Job updated successfully:', updatedJob);
    res.json({ message: 'Job updated successfully', job: updatedJob });
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;