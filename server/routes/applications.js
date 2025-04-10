const express = require('express');
const router = express.Router();
const multer = require('multer');
const Application = require('../models/Application');
const Job = require('../models/Job');
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

router.post('/', upload.single('resume'), async (req, res) => {
  try {
    console.log('Request received:', req.body);
    console.log('File received:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const { jobId, userId, coverLetter } = req.body;
    const resumePath = req.file.path;

    // Create a new job application
    const newApplication = new Application({ jobId, userId, coverLetter, resume: resumePath });
    await newApplication.save();

    // Increment total applicants in the job listing
    await Job.findByIdAndUpdate(jobId, { $inc: { totalApplicants: 1 } }, { new: true });
    
    // // Get the updated job (after incrementing total applicants)
    // const updatedJob = await Job.findByIdAndUpdate(jobId, { $inc: { totalApplicants: 1 } }, { new: true });
    // console.log('Updated job:', updatedJob);

    res.status(201).json({ message: 'Application submitted successfully' });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

module.exports = router;
