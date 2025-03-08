const nodemailer = require('nodemailer');
const userModel = require('../models/User');
const Notification = require('../models/Notification');

// Set up the email transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // e.g., 'Gmail', 'Yahoo', etc.
  auth: {
    user: process.env.USER_EMAIL, // Your email address (from .env)
    pass: process.env.USER_PASS,  // Your email password or app-specific password
  },
});

// Function to send email about account approval or rejection
const sendEmployerStatusEmail = async (email, status) => {
  const link = `http://localhost:3000/login`;
  let subject, text, html;

  if (status === 'approved') {
    subject = 'Your Employer Account has been Approved';
    text = `Congratulations, your account has been approved by the admin! You can now log in to your account using the following link: ${link}`;
    html = `<p>Congratulations, your account has been approved by the admin!</p>
            <p>You can now log in to your account using the following link: 
            <a href="${link}" style="background-color:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Login</a></p>`;
  } else if (status === 'rejected') {
    subject = 'Your Employer Account has been Rejected';
    text = 'Unfortunately, your account has been rejected by the admin.';
    html = `<p>Unfortunately, your account has been rejected by the admin.</p>`;
  }

  const mailOptions = {
    from: process.env.USER_EMAIL, // Sender's email address
    to: email, // Receiver's email (Employer)
    subject: subject, // Email subject
    text: text, // Plain text message
    html: html, // HTML message
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending status email:', error);
    throw new Error('Error sending email notification');
  }
};

// Admin Approve/Reject Employer
exports.adminApproveRejectEmployer = async (req, res) => {
  try {
    const { EmployerId, action } = req.body; // action could be "approve" or "reject"

    // Check if the admin is authenticated (you can customize this with your actual admin check)
    const admin = req.user; // Assuming admin is in req.user after authentication
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: "You are not authorized to approve Employers." });
    }

    // Find the Employer
    const Employer = await userModel.findById(EmployerId);
    if (!Employer || Employer.role !== 'employer') {
      return res.status(400).json({ message: "Employer not found or invalid role." });
    }

    // Find the notification for this Employer registration
    const notification = await Notification.findOne({ EmployerId: Employer._id, read: false });
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    // Handle approval
    if (action === 'approve') {
      Employer.isApproved = true; // Set isApproved to true if approved
      await Employer.save();

      // Update the notification message
      notification.message = `Employer ${Employer.name} has been approved.`;
      notification.read = true; // Mark it as read after approval
      await notification.save();

      // Send email to the Employer about approval
      await sendEmployerStatusEmail(Employer.email, 'approved');

      return res.status(200).json({ message: "Employer has been approved successfully." });
    } 
    // Handle rejection
    else if (action === 'reject') {
      await Employer.deleteOne(); // Remove the Employer from the system if rejected

      // Update the notification message
      notification.message = `Employer ${Employer.name} has been rejected.`;
      notification.read = true; // Mark it as read after rejection
      await notification.save();

      // Send email to the Employer about rejection
      await sendEmployerStatusEmail(Employer.email, 'rejected');

      return res.status(200).json({ message: "Employer registration has been rejected." });
    } 
    // Invalid action
    else {
      return res.status(400).json({ message: "Invalid action. Must be either 'approve' or 'reject'." });
    }
  } catch (error) {
    console.error("Error in admin approval:", error);
    res.status(500).json({ message: "Error in approval process.", error: error.message });
  }
};

// Controller to fetch all notifications for the admin
// Controller to fetch all notifications for the admin with Employer details (name, phone, email, licenseNo)
exports.getNotifications = async (req, res) => {
  try {
    // Fetch notifications for the logged-in admin and populate Employer details
    const notifications = await Notification.find({ adminId: req.user._id })
      .populate('employerId', 'name phone email companyName industry') // Populate EmployerId with specific fields
      .exec(); // Ensure the query is executed

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Controller to mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.read = true; // Set the read status to true
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Error updating notification" });
  }
};