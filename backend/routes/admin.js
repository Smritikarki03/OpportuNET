const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const { authenticate } = require('../middleware/authMiddleware');

// Get user statistics
router.get('/user-stats', authenticate, async (req, res) => {
    try {
        console.log('Fetching user statistics...');
        console.log('Request headers:', req.headers);

        // Get counts for different user types
        const [totalJobSeekers, totalEmployers] = await Promise.all([
            User.countDocuments({ role: 'jobseeker' }),
            User.countDocuments({ role: 'employer' })
        ]);

        console.log('User counts:', { totalJobSeekers, totalEmployers });

        // Get job statistics
        const jobs = await Job.find();
        const activeJobs = jobs.filter(job => job.status === 'Active').length;
        const inactiveJobs = jobs.filter(job => job.status === 'Inactive').length;

        console.log('Job counts:', { activeJobs, inactiveJobs, total: jobs.length });

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
            totalApplications
        });
    } catch (error) {
        console.error('Error in user-stats route:', error);
        res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    }
});

// Get notifications
router.get('/notifications', authenticate, async (req, res) => {
    try {
        // Get pending employer approvals
        const pendingEmployers = await User.find({ 
            role: 'employer', 
            status: 'pending' 
        }).select('name email companyName createdAt');

        res.json({
            notifications: pendingEmployers.map(employer => ({
                type: 'employer_approval',
                id: employer._id,
                name: employer.name,
                email: employer.email,
                companyName: employer.companyName,
                createdAt: employer.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
});

module.exports = router; 