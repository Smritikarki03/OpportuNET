const express = require('express');
const router = express.Router();
const multer = require('multer');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const path = require('path');
const cors = require('cors');
const { authenticate } = require('../middleware/authMiddleware');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure multer upload
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
}).fields([
  { name: 'resume', maxCount: 1 },
  { name: 'coverLetterFile', maxCount: 1 }
]);

// Wrap the route handler in a try-catch block for multer errors
const handleMulterUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'File upload error', error: err.message });
    } else if (err) {
      console.error('Unknown error:', err);
      return res.status(500).json({ message: 'Unknown error', error: err.message });
    }
    next();
  });
};

router.post('/', authenticate, handleMulterUpload, async (req, res) => {
  try {
    console.log('Application submission request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request files:', JSON.stringify(req.files, null, 2));
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));

    // Validate required fields
    const { jobId, userId, coverLetter, applicantName } = req.body;

    if (!req.files?.resume?.[0]) {
      console.log('Resume file missing');
      return res.status(400).json({ message: 'Resume file is required' });
    }

    if (!jobId || !userId) {
      console.log('Missing jobId or userId:', { jobId, userId });
      return res.status(400).json({ message: 'Job ID and User ID are required' });
    }

    if (!applicantName) {
      console.log('Missing applicant name in request body:', req.body);
      return res.status(400).json({ message: 'Applicant name is required' });
    }

    if (!coverLetter && !req.files?.coverLetterFile?.[0]) {
      console.log('Missing cover letter');
      return res.status(400).json({ message: 'Cover letter text or file is required' });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Found user:', { userId: user._id, name: user.name });

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      console.log('Job not found:', jobId);
      return res.status(404).json({ message: 'Job not found' });
    }
    console.log('Found job:', { jobId: job._id, title: job.title });

    // Check if user has already applied
    const existingApplication = await Application.findOne({ jobId, userId });
    if (existingApplication) {
      console.log('User already applied:', { jobId, userId });
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Get file paths
    const resumePath = req.files.resume[0].path;
    const coverLetterFilePath = req.files.coverLetterFile?.[0]?.path;

    console.log('Creating application with data:', {
      jobId,
      userId,
      applicantName,
      resumePath,
      coverLetterFilePath,
      hasResume: !!resumePath,
      hasCoverLetter: !!coverLetter,
      hasCoverLetterFile: !!coverLetterFilePath
    });

    // Create and save the application
    const newApplication = new Application({
      jobId,
      userId,
      applicantName: applicantName.trim(),
      coverLetter: coverLetter || '',
      resume: resumePath,
      coverLetterFile: coverLetterFilePath,
      status: 'APPLIED',
      appliedDate: new Date()
    });

    console.log('Attempting to save application:', JSON.stringify(newApplication, null, 2));
    const savedApplication = await newApplication.save();
    console.log('Application saved successfully:', JSON.stringify(savedApplication, null, 2));

    // Update job's applications array
    const applicationUpdate = {
      applicantId: userId,
      applicantName: applicantName.trim(),
      resume: resumePath,
      status: 'APPLIED',
      appliedDate: new Date()
    };

    console.log('Updating job with application:', JSON.stringify(applicationUpdate, null, 2));
    const updatedJob = await Job.findByIdAndUpdate(jobId, 
      {
        $push: { applications: applicationUpdate },
        $inc: { totalApplicants: 1 }
      },
      { new: true }
    );
    console.log('Job updated successfully:', JSON.stringify({
      jobId: updatedJob._id,
      title: updatedJob.title,
      totalApplicants: updatedJob.totalApplicants,
      applications: updatedJob.applications
    }, null, 2));

    // Update user's appliedJobs array
    const appliedJobUpdate = {
      date: new Date().toISOString().split('T')[0],
      role: job.title,
      company: job.company,
      status: 'APPLIED'
    };

    await User.findByIdAndUpdate(userId, {
      $push: { appliedJobs: appliedJobUpdate }
    });
    console.log('User updated successfully');

    // Create notification for employer
    const notification = new Notification({
      recipient: job.userId,
      message: `New application received from ${applicantName.trim()} for ${job.title} position`,
      type: 'application'
    });
    await notification.save();
    console.log('Notification created successfully');

    res.status(201).json({ 
      message: 'Application submitted successfully',
      application: savedApplication
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    if (error.name === 'ValidationError') {
      console.error('Validation error details:', error.errors);
      return res.status(400).json({ 
        message: 'Validation error', 
        error: error.message,
        details: error.errors
      });
    }
    res.status(500).json({ 
      message: 'Error submitting application', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE /api/applications/:applicationId - Delete an application
router.delete('/:applicationId', authenticate, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const deleted = await Application.findByIdAndDelete(applicationId);
    if (!deleted) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Error deleting application', error: error.message });
  }
});

// PUT /api/applications/:applicationId/archive - Archive/unarchive an application
router.put('/:applicationId/archive', authenticate, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { archived } = req.body;
    const updated = await Application.findByIdAndUpdate(
      applicationId,
      { archived: !!archived },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: `Application ${archived ? 'archived' : 'unarchived'} successfully` });
  } catch (error) {
    console.error('Error archiving application:', error);
    res.status(500).json({ message: 'Error archiving application', error: error.message });
  }
});

module.exports = router;
