const express = require('express');
const router = express.Router();
const multer = require('multer');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const path = require('path');
const cors = require('cors');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

router.post('/', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'coverLetterFile', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Request received:', req.body);
    console.log('Files received:', req.files);

    if (!req.files || !req.files['resume']) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const { jobId, userId, coverLetter } = req.body;
    const coverLetterFilePath = req.files['coverLetterFile'] ? req.files['coverLetterFile'][0].path : undefined;
    if (!jobId || !userId || (!coverLetter && !coverLetterFilePath)) {
      return res.status(400).json({ message: 'Cover letter text or file is required' });
    }

    // Save file paths
    const resumePath = req.files['resume'][0].path;

    // Create a new job application with both file paths
    const newApplication = new Application({
      jobId,
      userId,
      coverLetter: coverLetter || '',
      resume: resumePath,
      coverLetterFile: coverLetterFilePath
    });

    await newApplication.save();

    // Get job details to add to user's appliedJobs array
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Update user's appliedJobs array
    await User.findByIdAndUpdate(userId, {
      $push: {
        appliedJobs: {
          date: new Date().toISOString().split('T')[0],
          role: job.title,
          company: job.company,
          status: 'PENDING'
        }
      }
    });

    // Increment total applicants in the job listing
    await Job.findByIdAndUpdate(jobId, { $inc: { totalApplicants: 1 } }, { new: true });

    res.status(201).json({ message: 'Application submitted successfully' });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

module.exports = router;
