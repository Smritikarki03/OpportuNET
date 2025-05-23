const express = require("express");
const { adminApproveRejectEmployer, getNotifications, markNotificationAsRead, getUserStats, getPendingJobs } = require("../controllers/adminController");
const { authenticateAdmin } = require("../middleware/authMiddleware");
const Job = require("../models/Job");
const User = require("../models/User");
const Application = require('../models/Application');

const router = express.Router();

// Admin Routes
router.post("/approve-reject", authenticateAdmin, adminApproveRejectEmployer);

// Get all users
router.get("/users", authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Delete a user
router.delete("/users/:id", authenticateAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Get user statistics
router.get("/user-stats", authenticateAdmin, async (req, res) => {
  try {
    // Auto-update expired jobs to Inactive
    const now = new Date();
    await Job.updateMany(
      { status: 'Active', applicationDeadline: { $lt: now } },
      { $set: { status: 'Inactive' } }
    );

    // Get counts for different user types
    const [totalJobSeekers, totalEmployers, pendingEmployers] = await Promise.all([
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'employer' }),
      User.countDocuments({ role: 'employer', isApproved: false })
    ]);

    // Get job statistics
    const jobs = await Job.find();
    const activeJobs = jobs.filter(job => job.status === 'Active').length;
    const inactiveJobs = jobs.filter(job => job.status === 'Inactive').length;

    // Get total applications
    let totalApplications = 0;
    try {
      totalApplications = await Application.countDocuments();
    } catch (error) {
      console.error('Error calculating total applications:', error);
    }

    res.json({
      totalJobSeekers,
      totalEmployers,
      activeJobs,
      inactiveJobs,
      totalApplications,
      totalUsers: totalJobSeekers + totalEmployers,
      pendingNotifications: pendingEmployers
    });
  } catch (error) {
    console.error('Error in user-stats route:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

// Get pending jobs
router.get("/pending-jobs", authenticateAdmin, async (req, res) => {
  try {
    const pendingJobs = await Job.find({ status: 'pending' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(pendingJobs);
  } catch (error) {
    console.error('Error fetching pending jobs:', error);
    res.status(500).json({ message: 'Error fetching pending jobs', error: error.message });
  }
});

// Get pending jobs for admin approval
router.get('/pending-jobs', authenticateAdmin, getPendingJobs);

// Get notifications
router.get("/notifications", authenticateAdmin, getNotifications);

// Mark notification as read
router.put("/notifications/:id/read", authenticateAdmin, markNotificationAsRead);

// Get all applications for admin
router.get('/applications', authenticateAdmin, async (req, res) => {
  try {
    // Fetch all applications and populate job and user info, including company from job
    const applications = await Application.find()
      .populate({
        path: 'jobId',
        select: 'title company'
      })
      .populate('userId', 'name email');
    // Format for frontend
    const formatted = applications.map(app => ({
      _id: app._id,
      jobTitle: app.jobId?.title || 'N/A',
      company: app.jobId?.company || 'N/A',
      applicantName: app.userId?.name || 'N/A',
      applicantEmail: app.userId?.email || 'N/A',
      status: app.status?.toLowerCase() || 'pending',
      appliedDate: app.appliedDate,
      resumeUrl: app.resume,
      coverLetterUrl: app.coverLetterFile,
      coverLetter: app.coverLetter
    }));
    res.json({ applications: formatted });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Get all contact messages for admin
router.get('/contact-messages', authenticateAdmin, async (req, res) => {
  try {
    const ContactMessage = require('../models/ContactMessage');
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contact messages.' });
  }
});

// Delete a contact message by ID
router.delete('/contact-messages/:id', authenticateAdmin, async (req, res) => {
  try {
    const ContactMessage = require('../models/ContactMessage');
    const result = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete message.' });
  }
});

module.exports = router;
