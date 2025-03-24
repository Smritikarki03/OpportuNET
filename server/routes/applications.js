const express = require('express');
const router = express.Router();
const multer = require('multer');
const Application = require('../models/Application');  // Ensure this path is correct
const Job = require('../models/Job');  // Ensure this path is correct

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const updatedJob = await Job.findbyIdAndUpdate(jobId, { $inc: { totalApplicants: 1 } });
console.log('Updated job:', updatedJob);
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
    const { jobId, userId, coverLetter } = req.body;
    const resumePath = req.file.path;

    // Create a new job application
    const newApplication = new Application({ jobId, userId, coverLetter });
    await newApplication.save();


    // Increment total applicants in the job listing
    await Job.findByIdAndUpdate(jobId, { $inc: { totalApplicants: 1 } }, { new: true });
    res.status(201).json({ message: 'Application submitted successfully' });

    const updatedJob = await Job.findByIdAndUpdate(jobId, { $inc: { totalApplicants: 1 } }, { new: true });
    console.log('Updated job:', updatedJob);
    
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
  
});

module.exports = router;