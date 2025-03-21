const nodemailer = require("nodemailer");
const User = require("../models/User");
const Notification = require("../models/Notification");

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
            <a href="${link}" style="background-color:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Login</a></p>`;
  } else if (status === "rejected") {
    subject = "Your Employer Account has been Rejected";
    text = "Unfortunately, your account has been rejected by the admin.";
    html = `<p>Unfortunately, your account has been rejected by the admin.</p>`;
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

    const notification = await Notification.findOne({ employerId: employer._id, read: false });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    if (action === "approve") {
      employer.isApproved = true;
      await employer.save();

      notification.message = `Employer ${employer.name} has been approved.`;
      notification.read = true;
      await notification.save();

      await sendEmployerStatusEmail(employer.email, "approved");
      return res.status(200).json({ message: "Employer has been approved successfully." });
    } else if (action === "reject") {
      await employer.deleteOne();
      await Notification.deleteOne({ employerId: employer._id });
      await sendEmployerStatusEmail(employer.email, "rejected");
      return res.status(200).json({ message: "Employer registration has been rejected." });
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
    const notifications = await Notification.find({ adminId: req.user.id })
      .populate("employerId", "name contactnumber email companyName industry")
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

    if (notification.adminId.toString() !== req.user._id.toString()) {
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

// Explicitly export all functions
module.exports = {
  adminApproveRejectEmployer,
  getNotifications,
  markNotificationAsRead,
};