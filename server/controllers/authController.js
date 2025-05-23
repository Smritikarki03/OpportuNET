const bcrypt = require("bcryptjs");
const User = require('../models/User');
const JWT = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();
const Notification = require("../models/Notification");
const Job = require("../models/Job");

// Create OTP model
const OTP = require('../models/OTP');

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;
    const role = "jobseeker";

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists, please login" });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role,
      isProfileViewed: false,
    };
    if (role === 'jobseeker') {
      userData.firstLogin = true;
    }
    const user = new User(userData);
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Error in registration", error });
  }
};

exports.employerRegister = async (req, res) => {
  try {
    const {
      fullname,
      email,
      contactnumber,
      password,
      confirmpassword,
      companyname,
      industry,
      companylocation,
      role,
    } = req.body;

    if (
      !fullname ||
      !email ||
      !contactnumber ||
      !password ||
      !confirmpassword ||
      !companyname ||
      !industry ||
      !companylocation
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password should be at least 6 characters long" });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (role !== "employer") {
      return res.status(400).json({ message: "Invalid role for this route" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists, please login instead" });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const user = new User({
      name: fullname,
      email: email.toLowerCase(),
      phone: contactnumber, // Map contactnumber to phone
      password: hashedPassword,
      role,
      isApproved: false,
      isProfileViewed: false,
      isCompanySetup: false, // Initialize as false for new employers
      companyName: companyname,
      industry: industry,
      location: companylocation,
    });
    await user.save();
    console.log(`User created with ID: ${user._id}`);

    // Send pending approval email to employer
    try {
      const mailOptions = {
        from: process.env.USER_EMAIL,
        to: user.email,
        subject: "Your Employer Registration is Pending Approval",
        text: "Thank you for registering as an employer on OpportuNET. Your account is pending admin approval. You will receive an email once your account is approved or rejected.",
        html: "<div style='color:#000000;'><p>Thank you for registering as an employer on <b>OpportuNET</b>.</p><p>Your account is <b>pending admin approval</b>. You will receive an email once your account is approved or rejected.</p></div>"
      };
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending employer registration email:', error);
      // Do not block registration if email fails
    }

    // Create a Company document
    const company = new Company({
      userId: user._id,
      name: companyname,
      industry,
      location: companylocation,
    });
    await company.save();
    console.log(`Company created for userId: ${user._id}, company: ${JSON.stringify(company)}`);

    // Find the admin user (just like contact message notification)
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found in the database');
      return res.status(201).json({ success: true, message: 'Employer registered, but no admin notification sent.' });
    }

    // Create notification for admin (same as contact message notification)
    const notification = await Notification.create({
      message: `A new Employer ${fullname} has registered and is awaiting approval.`,
      recipient: admin._id,
      adminId: admin._id,
      employerId: user._id,
      read: false,
      type: 'employer_approval'
    });
    console.log('Created employer approval notification:', {
      id: notification._id,
      message: notification.message,
      recipient: notification.recipient,
      adminId: notification.adminId,
      type: notification.type
    });

    res.status(201).json({
      success: true,
      message: "Employer registered successfully. Await admin approval.",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Employer registration error:", error);
    res.status(500).json({ success: false, message: "Error in registration", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt - Input:", { email, password });

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("User found in DB:", user ? user.email : "No user");

    if (!user) {
      console.log("No user found for email:", email.toLowerCase());
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.role === "employer" && !user.isApproved) {
      return res.status(403).json({ message: "Admin needs to approve your account before you can log in." });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    console.log("Password comparison result:", isMatch);

    if (!isMatch) {
      console.log("Password mismatch for user:", user.email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // OTP on first login for jobseekers (only if firstLogin === true)
    if (user.role === 'jobseeker' && user.firstLogin === true) {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await OTP.findOneAndUpdate(
        { email: user.email },
        { email: user.email, otp, role: user.role },
        { upsert: true, new: true }
      );
      // Send OTP via email
      const mailOptions = {
        from: process.env.USER_EMAIL,
        to: user.email,
        subject: "Your OTP for OpportuNET Login",
        text: `Your OTP for login is: ${otp}. This OTP will expire in 5 minutes.`,
        html: `<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\"><h2 style=\"color: #0D9488;\">OpportuNET Login Verification</h2><p>Your OTP for login is:</p><h1 style=\"color: #0D9488; font-size: 32px; letter-spacing: 5px; text-align: center;\">${otp}</h1><p>This OTP will expire in 5 minutes.</p><p>If you didn't request this OTP, please ignore this email.</p></div>`
      };
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ success: false, message: "OTP sent to your email. Please verify to complete login.", otpRequired: true });
    }

    // Normal login (after first login)
    const token = JWT.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isProfileViewed: user.isProfileViewed,
        isCompanySetup: user.isCompanySetup,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// New endpoint: verify OTP for first login
exports.verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.role !== 'jobseeker' || !user.firstLogin) {
      return res.status(400).json({ message: "OTP verification not required" });
    }
    // Find OTP
    const otpRecord = await OTP.findOne({ email: email.toLowerCase(), otp, role: 'jobseeker' });
    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    // OTP is valid, delete it and set firstLogin to false
    await OTP.deleteOne({ _id: otpRecord._id });
    user.firstLogin = false;
    await user.save();
    // Issue token
    const token = JWT.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      success: true,
      message: "OTP verified, login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isProfileViewed: user.isProfileViewed,
        isCompanySetup: user.isCompanySetup,
      },
    });
  } catch (error) {
    console.error("Verify login OTP error:", error);
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};

const sendPasswordResetEmail = async (email, accessToken) => {
  const resetLink = `http://localhost:3000/reset-password?token=${accessToken}&email=${email}`;

  const mailOptions = {
    from: "np03cs4a220023@heraldcollege.edu.np",
    to: email,
    subject: "Password Reset Request",
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const accessToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiration = Date.now() + 3600000;

    user.resetPasswordToken = accessToken;
    user.resetPasswordExpires = tokenExpiration;
    await user.save();

    await sendPasswordResetEmail(email, accessToken);

    res.status(200).send({ message: "Password reset email sent" });
  } catch (error) {
    console.log("Forgot password error:", error);
    return res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).send({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).send({ message: "Something went wrong", error });
  }
};

exports.userInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      resume: user.resume,
      skills: user.skills,
      image: user.image,
      bio: user.bio,
      isProfileViewed: user.isProfileViewed,
      appliedJobs: user.role === 'jobseeker' ? user.appliedJobs.map(job => ({ ...job, applicationId: job.applicationId })) : user.appliedJobs,
      companyName: user.companyName,
      location: user.location,
      experienceLevel: user.experienceLevel,
      education: user.education
    };

    // If user is an employer, fetch their posted jobs
    if (user.role === 'employer') {
      const postedJobs = await Job.find({ userId: user._id })
        .select('title location salary status _id')
        .sort({ createdAt: -1 });
      userData.postedJobs = postedJobs;
      console.log('Including posted jobs:', postedJobs);
    }

    console.log("User info response:", userData);
    res.json(userData);
  } catch (error) {
    console.error("User info error:", error);
    res.status(500).json({
      message: "Server error, unable to fetch user data",
      error: error.message || "Internal Server Error",
    });
  }
};

exports.updateProfileViewed = async (req, res) => {
  try {
    const { isProfileViewed } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isProfileViewed },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Profile viewed status updated", user });
  } catch (error) {
    console.error("Update profile viewed error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

// Add the editProfile endpoint
exports.editProfile = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const updateData = {
      name: req.body.fullName,
      phone: req.body.phone,
      skills: req.body.skills ? req.body.skills.split(",").map(skill => skill.trim()) : [],
    };

    // Add employer-specific fields if they exist
    if (req.body.companyName) updateData.companyName = req.body.companyName;
    if (req.body.location) updateData.location = req.body.location;
    if (req.body.experienceLevel) updateData.experienceLevel = req.body.experienceLevel;
    if (req.body.education) updateData.education = req.body.education;
    if (req.body.bio) updateData.bio = req.body.bio;

    // Handle file uploads
    if (req.files && req.files['image']) {
      updateData.image = `/uploads/${req.files['image'][0].filename}`;
    }
    if (req.files && req.files['cv']) {
      updateData.resume = `/uploads/${req.files['cv'][0].filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log("Updated user in database:", user);

    // Send back all user fields in response
    res.json({
      message: 'Profile updated successfully',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        resume: user.resume,
        skills: user.skills,
        image: user.image,
        bio: user.bio,
        isProfileViewed: user.isProfileViewed,
        appliedJobs: user.appliedJobs,
        companyName: user.companyName,
        location: user.location,
        experienceLevel: user.experienceLevel,
        education: user.education
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add new OTP-related functions
exports.sendOTP = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    // Only allow OTP for new job seekers
    if (role !== 'jobseeker') {
      return res.status(400).json({ message: "OTP is only available for job seekers" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists, please login instead" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database
    await OTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { email: email.toLowerCase(), otp, role },
      { upsert: true, new: true }
    );

    // Send OTP via email
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Your OTP for OpportuNET Registration",
      text: `Your OTP for registration is: ${otp}. This OTP will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0D9488;">Welcome to OpportuNET!</h2>
          <p>Your OTP for registration is:</p>
          <h1 style="color: #0D9488; font-size: 32px; letter-spacing: 5px; text-align: center;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp || !role) {
      return res.status(400).json({ message: "Email, OTP, and role are required" });
    }

    // Only allow OTP verification for job seekers
    if (role !== 'jobseeker') {
      return res.status(400).json({ message: "OTP verification is only available for job seekers" });
    }

    // Find the OTP in database
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      role
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};

exports.checkNewJobseeker = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    // If user doesn't exist, they are a new job seeker
    const isNewJobseeker = !existingUser;

    res.status(200).json({ isNewJobseeker });
  } catch (error) {
    console.error("Check new jobseeker error:", error);
    res.status(500).json({ message: "Error checking jobseeker status", error: error.message });
  }
}; 