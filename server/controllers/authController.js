const bcrypt = require("bcryptjs");
const User = require('../models/User');
const JWT = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();
const Notification = require("../models/Notification");
const Job = require("../models/Job");

exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
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
      return res.status(400).json({ message: "User already exists, please login instead" });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      isProfileViewed: false,
    });
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
    });
    await user.save();
    console.log(`User created with ID: ${user._id}`);

    // Create a Company document
    const company = new Company({
      userId: user._id,
      name: companyname,
      industry,
      location: companylocation,
    });
    await company.save();
    console.log(`Company created for userId: ${user._id}, company: ${JSON.stringify(company)}`);

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      return res.status(500).json({ message: "Admin not found. Unable to send notification." });
    }

    const notification = new Notification({
      message: `A new Employer ${fullname} has registered and is awaiting approval.`,
      adminId: admin._id,
      employerId: user._id,
    });
    await notification.save();

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
    console.log("Login attempt - Input:", { email, password }); // Debug: Log input

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("User found in DB:", user ? user.email : "No user"); // Debug: Log user or null

    if (!user) {
      console.log("No user found for email:", email.toLowerCase()); // Debug
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.role === "employer" && !user.isApproved) {
      return res.status(403).json({ message: "Admin needs to approve your account before you can log in." });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    console.log("Password comparison result:", isMatch); // Debug: Log password match

    if (!isMatch) {
      console.log("Password mismatch for user:", user.email); // Debug
      return res.status(400).json({ message: "Invalid email or password" });
    }

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
        isCompanySetup: user.isCompanySetup, // Include this in the response
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

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
      appliedJobs: user.appliedJobs,
      companyName: user.companyName,
      location: user.location,
      experienceLevel: user.experienceLevel,
      education: user.education
    };
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