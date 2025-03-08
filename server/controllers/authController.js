const bcrypt = require('bcryptjs');
const userModel = require('../models/User');
const JWT = require('jsonwebtoken');
const authenticate = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require("dotenv").config();
const Notification = require('../models/Notification'); // Import Notification model

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Set default role for Jobseeker
    const role = "jobseeker"; // Default role for Jobseeker

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if password and confirmPass are the same
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if password is at least 6 characters long
    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists, please login instead" });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Register the user with isProfileViewed
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      role,
      isProfileViewed: false, // Add this field
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error in registration", error });
  }
};

// Employer Registration
exports.employerRegister = async (req, res) => {
  try {
    const { fullname, email, contactnumber, password, confirmpassword, companyname, industry, companylocation, role } = req.body;

    if (!fullname || !email || !contactnumber || !password || !confirmpassword || !companyname || !industry || !companylocation) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (role !== 'employer') {
      return res.status(400).json({ message: "Invalid role for this route" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists, please login instead" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name: fullname,
      email,
      contactnumber,
      password: hashedPassword,
      companyName: companyname,
      industry,
      companyLocation: companylocation,
      role,
      isApproved: false,
      isProfileViewed: false, // Set for consistency
    });
    await user.save();

    const admin = await userModel.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(500).json({ message: "Admin not found. Unable to send notification." });
    }

    const notification = new Notification({
      message: `A new Employer ${fullname} has registered and is awaiting approval.`,
      adminId: admin._id, // Use admin._id instead of admin object
      employerId: user._id,
    });
    await notification.save();

    res.status(201).json({
      success: true,
      message: "Employer registered successfully. Await admin approval.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error in Employer registration:", error);
    res.status(500).json({ success: false, message: "Error in registration", error: error.message });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (user.role === 'employer' && !user.isApproved) {
      return res.status(403).json({ message: 'Admin needs to approve your account before you can log in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = JWT.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        isApproved: user.isApproved,
        isProfileViewed: user.isProfileViewed // Include this
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
const transporter = nodemailer.createTransport({
  service: 'Gmail', // e.g., 'Gmail', 'Yahoo', etc.
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

const sendPasswordResetEmail = async (email, accessToken) => {
  const resetLink = `http://localhost:3000/forgot-password?token=${accessToken}&email=${email}`;

  const mailOptions = {
    from: 'np03cs4a220023@heraldcollege.edu.np', // sender address
    to: email, // receiver address
    subject: 'Password Reset Request', // Subject line
    text: `You requested for a password reset. Click the link to reset your password: ${resetLink}`,
    html: `<p>You requested for a password reset.</p><p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Generate a reset token
    const accessToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiration = Date.now() + 3600000; // 1 hour from now

    // Update user record with the reset token and expiration
    user.resetPasswordToken = accessToken;
    user.resetPasswordExpires = tokenExpiration;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, accessToken);

    res.status(200).send({ message: "Password reset email sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

// Fix for resetPassword
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).send({ message: "All fields are required" });
    }

    // Find the user by email and reset token
    const user = await userModel.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token is still valid
    });

    if (!user) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).send({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send({ message: "Something went wrong", error });
  }
};

// User info route
exports.userInfo = async (req, res) => {
  try {
    // Assuming req.user.id contains the user ID
    const user = await userModel.findById(req.user.id); 

    if (!user) {
      // Return a 404 if the user is not found
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user data as JSON if found
    res.json(user);  
  } catch (error) {
    // Handle specific errors (e.g., database connection issues)
    console.error(error);  // Log error details for debugging purposes
    res.status(500).json({ 
      message: 'Server error, unable to fetch user data', 
      error: error.message || 'Internal Server Error'
    });
  }
};
exports.updateProfileViewed = async (req, res) => {
  try {
    const { isProfileViewed } = req.body;
    const userId = req.user.id; // Assumes authMiddleware sets req.user from JWT

    const user = await userModel.findByIdAndUpdate(
      userId,
      { isProfileViewed },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Profile viewed status updated", user });
  } catch (error) {
    console.error("Error updating profile viewed status:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};