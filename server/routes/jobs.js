// routes/jobs.js
const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { authenticate } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const User = require('../models/User');
const Notification = require('../models/Notification');

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
    console.log('GET /jobs - User data:', {
      userId: req.user?.id,
      role: req.user?.role,
      isAuthenticated: !!req.user
    });
    
    let query = {};
    
    // If user is admin, show all jobs
    if (req.user?.role?.toLowerCase() === 'admin') {
      console.log('Admin user - showing all jobs');
      query = {};
    }
    // If user is employer, only show their jobs
    else if (req.user?.role?.toLowerCase() === 'employer') {
      console.log('Employer user - showing their jobs');
      console.log('Employer ID:', req.user.id);
      query = { userId: req.user.id };
    }
    // For job seekers and default case, show all active jobs
    else {
      console.log('Job seeker or default - showing active jobs');
      query.status = 'Active';
    }

    console.log('Applying query filter:', query);

    // First, fetch all jobs matching the query
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    console.log(`Found ${jobs.length} jobs matching query`);

    // Get all job IDs
    const jobIds = jobs.map(job => job._id);

    // Fetch all applications for these jobs from the Application collection
    const applications = await Application.find({
      jobId: { $in: jobIds }
    }).lean();

    console.log(`Found ${applications.length} applications in Application collection`);

    // Create a map of applications by jobId
    const applicationsByJobId = {};
    applications.forEach(app => {
      const jobIdStr = app.jobId.toString();
      if (!applicationsByJobId[jobIdStr]) {
        applicationsByJobId[jobIdStr] = [];
      }
      applicationsByJobId[jobIdStr].push({
        _id: app._id,
        applicantId: app.userId,
        applicantName: app.applicantName,
        resume: app.resume,
        coverLetter: app.coverLetter,
        coverLetterFile: app.coverLetterFile,
        status: app.status,
        appliedDate: app.appliedDate || app.createdAt,
        archived: app.archived
      });
    });

    // Combine jobs with their applications
    const jobsWithApplications = jobs.map(job => {
      const jobIdStr = job._id.toString();
      const jobApplications = applicationsByJobId[jobIdStr] || [];
      
      // Get applications from both sources
      const existingApplications = job.applications || [];
      
      console.log(`Processing job ${job.title} (${jobIdStr}):`, {
        existingApplicationsCount: existingApplications.length,
        newApplicationsCount: jobApplications.length
      });

      // Create a map of existing applications by applicantId for faster lookup
      const existingApplicationsMap = new Map(
        existingApplications.map(app => [app.applicantId.toString(), {
          ...app,
          coverLetter: app.coverLetter || '',
          coverLetterFile: app.coverLetterFile || ''
        }])
      );

      // Combine applications, preferring the Application collection version if it exists
      const allApplications = [...jobApplications];

      // Add any applications from job.applications that aren't in the Application collection
      existingApplications.forEach(existing => {
        const existingId = existing.applicantId.toString();
        if (!jobApplications.some(app => app.applicantId.toString() === existingId)) {
          allApplications.push({
            ...existing,
            coverLetter: existing.coverLetter || '',
            coverLetterFile: existing.coverLetterFile || ''
          });
        }
      });

      // Sort applications by date, most recent first
      allApplications.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

      const result = {
        ...job,
        applications: allApplications,
        totalApplicants: allApplications.length
      };

      console.log(`Final applications count for job ${job.title}: ${result.applications.length}`);
      return result;
    });

    console.log('Sending response with jobs and applications');
    res.json(jobsWithApplications);
  } catch (error) {
    console.error('Error in GET /jobs:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error fetching jobs', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/jobs/public - Get all active jobs (no auth required)
router.get('/public', async (req, res) => {
  try {
    console.log('GET /jobs/public - Fetching public jobs');
    const jobs = await Job.find({ status: 'Active' })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
    
    console.log(`Found ${jobs.length} public jobs`);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching public jobs:', error);
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

    // Always set status to Active if deadline is in the future
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { 
        ...updates,
        status: 'Active', // Always set to Active when deadline is updated to future date
        isActive: true,   // Also update isActive field
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedJob) {
      console.log('Failed to update job:', jobId);
      return res.status(500).json({ message: 'Failed to update job' });
    }

    console.log('Job updated successfully:', updatedJob);
    res.json({ 
      message: 'Job updated and activated successfully',
      job: updatedJob 
    });
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update application status
router.put('/:jobId/applications/:applicantId/status', authenticate, async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;
    const { status, interviewTime } = req.body;

    const validStatuses = [
      'APPLIED',
      'REVIEWED',
      'SHORTLISTED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEWED',
      'ACCEPTED',
      'REJECTED'
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update status in Job model
    const job = await Job.findOneAndUpdate(
      { 
        _id: jobId,
        'applications.applicantId': applicantId
      },
      {
        $set: {
          'applications.$.status': status
        }
      },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: 'Job or application not found' });
    }

    // Update status and interviewTime in Application model
    let appUpdate = { status };
    if (status === 'INTERVIEW_SCHEDULED' && interviewTime) {
      appUpdate.interviewTime = interviewTime;
    } else if (status === 'INTERVIEW_SCHEDULED' && !interviewTime) {
      return res.status(400).json({ message: 'Interview time required for INTERVIEW_SCHEDULED status' });
    }
    const applicationDoc = await Application.findOneAndUpdate(
      { jobId, userId: applicantId },
      appUpdate,
      { new: true }
    );

    // Update status in User's appliedJobs array
    await User.findOneAndUpdate(
      { 
        _id: applicantId,
        'appliedJobs.role': job.title,
        'appliedJobs.company': job.company
      },
      {
        $set: {
          'appliedJobs.$.status': status
        }
      }
    );

    // Get applicant email
    const applicant = await User.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    // Send email to applicant for certain statuses
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });
    let subject = `Application Update for ${job.title}`;
    let text = `Dear ${applicant.name},\n\nWe are pleased to inform you that your application for the ${job.title} position at ${job.company} has progressed to the next stage.\n\nYour interview has been scheduled for:\n\nDate: [DATE]\nTime: [TIME]\nLocation: [Add location or \"Zoom link will be shared soon\"]\n\nPlease confirm your availability by replying to this email. If you have any questions or need to reschedule, feel free to contact us at [recruiter email/contact number].\n\nWe look forward to speaking with you!\n\nBest regards,\nThe ${job.company} Recruitment Team`;
    let html = undefined;
    if (status === 'INTERVIEW_SCHEDULED' && interviewTime) {
      // Format date and time
      const interviewDate = new Date(interviewTime);
      const dateStr = interviewDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = interviewDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      // Fetch employer info
      const employer = await User.findById(job.userId);
      const employerEmail = employer?.email || '[recruiter email]';
      const employerPhone = employer?.phone || '[contact number]';
      const locationStr = job.location || '[location]';
      text = `Dear ${applicant.name},\n\nWe are pleased to inform you that your application for the ${job.title} position at ${job.company} has progressed to the next stage.\n\nYour interview has been scheduled for:\n\nDate: ${dateStr}\nTime: ${timeStr}\nLocation: ${locationStr}\n\nPlease confirm your availability by replying to this email. If you have any questions or need to reschedule, feel free to contact us at ${employerEmail} or ${employerPhone}.\n\nWe look forward to speaking with you!\n\nBest regards,\nThe ${job.company} Recruitment Team`;
      html = `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #222;">
        <p>Dear ${applicant.name},</p>
        <p>We are pleased to inform you that your application for the <b>${job.title}</b> position at <b>${job.company}</b> has progressed to the next stage.</p>
        <p>Your interview has been scheduled for:</p>
        <ul style="list-style: none; padding-left: 0;">
          <li><b>📅 Date:</b> ${dateStr}</li>
          <li><b>🕚 Time:</b> ${timeStr}</li>
          <li><b>📍 Location:</b> ${locationStr}</li>
        </ul>
        <p>Please confirm your availability by replying to this email. If you have any questions or need to reschedule, feel free to contact us at <b>${employerEmail}${employerPhone ? ' or ' + employerPhone : ''}</b>.</p>
        <p>We look forward to speaking with you!</p>
        <p style="margin-top: 32px;">Best regards,<br/>The ${job.company} Recruitment Team</p>
      </div>`;
    }
    if (status === 'ACCEPTED') {
      text += `\n\nCongratulations! You have been offered the job.`;
    }
    if (status === 'REJECTED') {
      text += `\n\nThank you for your interest. Unfortunately, you were not selected.`;
    }
    if (['INTERVIEW_SCHEDULED', 'ACCEPTED', 'REJECTED'].includes(status)) {
      try {
        await transporter.sendMail({
          from: process.env.USER_EMAIL,
          to: applicant.email,
          subject,
          text,
          ...(html ? { html } : {})
        });
      } catch (e) {
        console.error('Error sending status email:', e);
      }
    }

    // Create notification for the applicant
    let notificationMessage = `Your application for ${job.title} is now at stage: ${status.replace('_', ' ')}.`;
    if (["INTERVIEW_SCHEDULED", "ACCEPTED", "REJECTED"].includes(status)) {
      notificationMessage += " Please check your mail for more details.";
    }
    const notification = new Notification({
      recipient: applicantId,
      message: notificationMessage
    });
    await notification.save();

    res.json({ message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
});

module.exports = router;