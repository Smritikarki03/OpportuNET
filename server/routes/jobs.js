// routes/jobs.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { authenticate } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Middleware to check and update job status based on deadline
const checkJobStatus = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'Active' });
    for (const job of jobs) {
      if (job.deadline < new Date()) {
        job.status = 'Inactive';
        await job.save();
      }
    }
    next();
  } catch (error) {
    console.error('Error checking job status:', error);
    next();
  }
};

// Apply the middleware to all routes
router.use(checkJobStatus);

router.post('/', authenticate, async (req, res) => {
  try {
    console.log('Received job posting request:', req.body);
    console.log('User making request:', req.user);

    // Ensure the user is an employer
    if (req.user.role !== 'employer') {
      console.log('User is not an employer:', req.user.role);
      return res.status(403).json({ message: 'Only employers can post jobs.' });
    }

    const { title, description, requirements, salary, location, jobType, experienceLevel, noOfPositions, company, deadline } = req.body;

    // Validate required fields
    const requiredFields = ['title', 'description', 'requirements', 'salary', 'location', 'jobType', 'experienceLevel', 'noOfPositions', 'company', 'deadline'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate deadline is not in the past
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadlineDate < today) {
      console.log('Invalid deadline - date is in the past:', deadline);
      return res.status(400).json({ message: 'Deadline cannot be in the past' });
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
      noOfPositions: parseInt(noOfPositions),
      company,
      deadline: new Date(deadline),
      status: 'Active',
      createdAt: new Date(),
      totalApplicants: 0
    };

    console.log('Creating job with data:', jobData);
    const job = new Job(jobData);
    await job.save();
    console.log(`Job posted successfully by ${req.user.id}:`, job);
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Error posting job:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error posting job', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/jobs - Get all jobs (admin) or filtered jobs based on role
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};
    
    // If user is admin, show all jobs
    if (req.user.role.toLowerCase() === 'admin') {
      // Admin can see all jobs
      query = {};
    }
    // If user is employer, only show their jobs
    else if (req.user.role.toLowerCase() === 'employer') {
      query.userId = req.user.id;
    }
    // For job seekers, only show active jobs
    else if (req.user.role.toLowerCase() === 'jobseeker') {
      query.status = 'Active';
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate({
        path: 'applications',
        select: 'applicantName resume status appliedDate'
      });

    // For employers, include application details
    if (req.user.role.toLowerCase() === 'employer') {
      console.log('Sending jobs with applications for employer:', req.user.id);
    }

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
    
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    // First check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Allow admin to delete any job, or employer to delete their own jobs
    if (req.user.role.toLowerCase() === 'admin' || job.userId.toString() === req.user.id) {
      await Job.findByIdAndDelete(jobId);
      return res.status(200).json({ message: 'Job deleted successfully' });
    }

    // If not admin or job owner, return unauthorized
    return res.status(403).json({ message: 'Unauthorized to delete this job' });
  } catch (err) {
    console.error('Error deleting job:', err);
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