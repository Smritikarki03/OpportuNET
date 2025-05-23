const nodemailer = require("nodemailer");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Job = require('../models/Job');
const Application = require('../models/Application');

// Set up the email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

const sendEmployerStatusEmail = async (email, status) => {
  const link = `http://localhost:3000/login`;
  let subject, text, html;

  if (status === "approved") {
    subject = "Your Employer Account has been Approved";
    text = `Congratulations, your account has been approved by the admin! You can now log in to your account using the following link: ${link}`;
    html = `<p>Congratulations, your account has been approved by the admin!</p>
            <p>You can now log in to your account using the following link: 
            <a href="${link}" style="background-color:#000000;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Login</a></p>`;
  } else if (status === "rejected") {
    subject = "Your Employer Account has been Rejected";
    text = "Your employer account has been rejected by the admin. Please check your details and try again if you believe this was a mistake.";
    html = `<p>Your employer account has been <b>rejected</b> by the admin.</p><p>Please check your details and try again if you believe this was a mistake.</p>`;
  }

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: subject,
    text: text,
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending status email:", error);
    throw new Error("Error sending email notification");
  }
};

const adminApproveRejectEmployer = async (req, res) => {
  try {
    const { employerId, action } = req.body;

    if (!employerId || !action) {
      return res.status(400).json({ message: "Employer ID and action are required." });
    }

    const employer = await User.findById(employerId);
    if (!employer || employer.role !== "employer") {
      return res.status(400).json({ message: "Employer not found or invalid role." });
    }

    let notification = await Notification.findOne({ employerId: employer._id, read: false });

    if (action === "approve") {
      employer.isApproved = true;
      await employer.save();
      if (notification) {
        notification.message = `Employer ${employer.name} has been approved.`;
        notification.read = true;
        await notification.save();
      }
      // Do NOT create a new notification for approval
      let emailWarning = false;
      try {
        await sendEmployerStatusEmail(employer.email, "approved");
      } catch (emailError) {
        emailWarning = true;
        console.error("Email sending failed, but employer was approved:", emailError);
      }
      return res.status(200).json({ message: "Employer has been approved successfully.", emailWarning });
    } else if (action === "reject") {
      let emailWarning = false;
      try {
        console.log('Sending rejection email to:', employer.email);
        await sendEmployerStatusEmail(employer.email, "rejected");
        console.log('Rejection email sent successfully to:', employer.email);
      } catch (emailError) {
        emailWarning = true;
        console.error("Email sending failed, but employer was rejected:", emailError);
      }
      // Wait 10 seconds before deleting the employer
      await new Promise(resolve => setTimeout(resolve, 10000));
      await employer.deleteOne();
      if (notification) {
        await Notification.deleteOne({ _id: notification._id });
      }
      // Do NOT create a new notification for rejection
      return res.status(200).json({ message: "Employer registration has been rejected.", emailWarning });
    } else {
      return res.status(400).json({ message: "Invalid action. Must be either 'approve' or 'reject'." });
    }
  } catch (error) {
    console.error("Error in admin approval:", error);
    res.status(500).json({ message: "Error in approval process.", error: error.message });
  }
};


const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { adminId: req.user.id },
        { recipient: req.user.id },
        { type: 'employer_approval' }
      ]
    })
    .populate("employerId", "name contactnumber email companyName industry")
    .sort({ createdAt: -1 })
    .exec();

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if user is either adminId or recipient
    if (notification.adminId?.toString() !== req.user._id.toString() && 
        notification.recipient?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to mark this notification as read" });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Error updating notification" });
  }
};

// Add the missing getUserStats function
const getUserStats = async (req, res) => {
  try {
    // Get counts of different user types
    const jobSeekersCount = await User.countDocuments({ role: 'jobseeker' });
    const employersCount = await User.countDocuments({ role: 'employer' });
    const approvedEmployersCount = await User.countDocuments({ role: 'employer', isApproved: true });
    const pendingEmployersCount = await User.countDocuments({ role: 'employer', isApproved: false });

    // Get job statistics
    const jobs = await Job.find();
    const activeJobs = jobs.filter(job => job.status === 'Active').length;
    const inactiveJobs = jobs.filter(job => job.status === 'Inactive').length;
    // Use Application collection for total applications, excluding archived
    const totalApplications = await Application.countDocuments({ archived: { $ne: true } });

    // Get unread notification count for the admin
    const unreadNotificationsCount = await Notification.countDocuments({
      $or: [
        { adminId: req.user.id },
        { recipient: req.user.id }
      ],
      read: false
    });

    res.status(200).json({
      totalJobSeekers: jobSeekersCount,
      totalEmployers: employersCount,
      activeJobs,
      inactiveJobs,
      totalApplications,
      totalUsers: jobSeekersCount + employersCount,
      pendingNotifications: unreadNotificationsCount // This is what the frontend uses for the bell icon
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Error fetching user statistics" });
  }
};

// Get pending jobs for admin approval
const getPendingJobs = async (req, res) => {
  try {
    const pendingJobs = await Job.find({ status: 'pending' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(pendingJobs);
  } catch (error) {
    console.error("Error fetching pending jobs:", error);
    res.status(500).json({ message: "Error fetching pending jobs" });
  }
};

// Explicitly export all functions
module.exports = {
  adminApproveRejectEmployer,
  getNotifications,
  markNotificationAsRead,
  getUserStats,
  getPendingJobs
};