const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// Helper function to check and update job status
const updateJobStatus = async (job) => {
  const now = new Date();
  const deadline = new Date(job.deadline);
  
  if (deadline < now && job.status === 'Active') {
    job.status = 'Inactive';
    job.isActive = false;
    await job.save();
  }
  return job;
};

// Create a new job posting
router.post('/', auth, async (req, res) => {
    try {
        const jobData = {
            ...req.body,
            userId: req.user._id,
            status: 'Active',
            isActive: true
        };
        const job = new Job(jobData);
        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all job postings
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find();
        
        // Update status for each job based on deadline
        const updatedJobs = await Promise.all(
            jobs.map(async (job) => await updateJobStatus(job))
        );

        // Filter to only return active jobs if specified
        const activeOnly = req.query.activeOnly === 'true';
        const filteredJobs = activeOnly 
            ? updatedJobs.filter(job => job.status === 'Active')
            : updatedJobs;

        res.json(filteredJobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific job posting
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        // Update status if needed
        await updateJobStatus(job);
        
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a job posting
router.patch('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findOne({ _id: req.params.id, userId: req.user._id });
        if (!job) {
            return res.status(404).json({ message: 'Job not found or unauthorized' });
        }

        Object.keys(req.body).forEach(key => {
            job[key] = req.body[key];
        });

        // Check deadline and update status
        await updateJobStatus(job);

        await job.save();
        res.json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a job posting
router.delete('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!job) {
            return res.status(404).json({ message: 'Job not found or unauthorized' });
        }
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get jobs posted by the authenticated user
router.get('/user/myjobs', auth, async (req, res) => {
    try {
        const jobs = await Job.find({ userId: req.user._id });
        
        // Update status for each job based on deadline
        const updatedJobs = await Promise.all(
            jobs.map(async (job) => await updateJobStatus(job))
        );

        res.json(updatedJobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 