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
    // Get counts for different user types
    const [totalJobSeekers, totalEmployers] = await Promise.all([
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'employer' })
    ]);

    // Get job statistics
    const jobs = await Job.find();
    const activeJobs = jobs.filter(job => job.status === 'Active').length;
    const inactiveJobs = jobs.filter(job => job.status === 'Inactive').length;

    // Get total applications
    let totalApplications = 0;
    try {
      const applicationStats = await Job.aggregate([
        {
          $project: {
            applicationCount: {
              $cond: {
                if: { $isArray: "$applications" },
                then: { $size: "$applications" },
                else: 0
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            totalApplications: { $sum: "$applicationCount" }
          }
        }
      ]);
      totalApplications = applicationStats[0]?.totalApplications || 0;
    } catch (error) {
      console.error('Error calculating total applications:', error);
    }

    res.json({
      totalJobSeekers,
      totalEmployers,
      activeJobs,
      inactiveJobs,
      totalApplications,
      totalUsers: totalJobSeekers + totalEmployers
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
      coverLetterUrl: app.coverLetterFile
    }));
    res.json({ applications: formatted });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

module.exports = router;
