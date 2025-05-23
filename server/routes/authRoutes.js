const express = require("express");
const { register, login, employerRegister, forgotPassword, resetPassword, updateProfileViewed, userInfo } = require("../controllers/authController");
const { assignEmployerRole } = require("../middleware/authMiddleware");
const authenticate = require("../middleware/authMiddleware").authenticate;
const multer = require('multer');
const userModel = require('../models/User'); // Adjust the path to your User model
const path = require('path');
const Job = require('../models/Job'); // Make sure to import the Job model
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');
const authController = require("../controllers/authController");

const router = express.Router();

// Multer configuration (already defined in server.js, but we need to redefine it here if not passed)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store files in the uploads directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

// Authentication Routes
router.post("/register", register);
router.post("/employerRegister", assignEmployerRole, employerRegister);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/userInfo", authenticate, userInfo);
router.post("/updateProfileViewed", authenticate, updateProfileViewed);

// New route for company setup
router.post("/setup-company", authenticate, async (req, res) => {
  try {
    const { name, industry, location, logo, description, website } = req.body;
    const userId = req.user.id; // From auth middleware

    const user = await userModel.findById(userId);
    if (!user || user.role !== "employer") {
      return res.status(404).json({ message: "Employer not found" });
    }

    // Update company details
    user.companyName = name;
    user.industry = industry;
    user.companyLocation = location;
    user.logo = logo; // Add logo field to userModel if not already present
    user.description = description; // Add description field to userModel if not already present
    user.website = website; // Add website field to userModel if not already present
    user.isCompanySetup = true;

    await user.save();

    res.status(200).json({ success: true, message: "Company setup successful", user });
  } catch (error) {
    console.error("Company setup error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

// Edit profile endpoint with file uploads using multer
router.put("/editProfile", authenticate, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
]), async (req, res) => {
  try {
    const { fullName, phone, skills, companyName, location, experienceLevel, education } = req.body;
    const userId = req.user.id;

    const updateData = {
      name: fullName,
      phone,
      skills: skills ? skills.split(",").map(skill => skill.trim()) : [],
    };

    // Add employer-specific fields if they exist
    if (companyName) updateData.companyName = companyName;
    if (location) updateData.location = location;
    if (experienceLevel) updateData.experienceLevel = experienceLevel;
    if (education) updateData.education = education;

    // Handle uploaded files
    if (req.files['image']) {
      updateData.image = `/uploads/${req.files['image'][0].filename}`;
    }
    if (req.files['cv']) {
      updateData.resume = `/uploads/${req.files['cv'][0].filename}`;
    }

    const user = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

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
        companyName: user.companyName,
        location: user.location,
        experienceLevel: user.experienceLevel,
        education: user.education,
        isProfileViewed: user.isProfileViewed,
        appliedJobs: user.appliedJobs,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for jobseeker signup/login
router.post('/send-otp', async (req, res) => {
  const { email, role } = req.body;
  try {
    // For new job seekers during signup, we don't need to check if user exists
    if (role === 'jobseeker') {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Save OTP to database
      const newOtp = new OTP({
        email: email.toLowerCase(),
        otp,
        role,
        createdAt: new Date()
      });
      await newOtp.save();

      // Send OTP email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.USER_EMAIL,
          pass: process.env.USER_PASSWORD,
        },
      });
      await transporter.sendMail({
        from: process.env.USER_EMAIL,
        to: email,
        subject: 'Your OpportuNET Verification Code',
        text: `Your verification code is: ${otp}. It is valid for 5 minutes.`,
        html: `<div style="font-family: Arial, sans-serif; font-size: 16px; color: #222;">
          <p>Your verification code is:</p>
          <h2 style="letter-spacing: 4px;">${otp}</h2>
          <p>This code is valid for 5 minutes.</p>
        </div>`
      });
      res.json({ success: true, message: 'OTP sent to your email.' });
    } else {
      res.status(400).json({ message: 'Invalid role specified' });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// Verify OTP for jobseeker signup/login
router.post('/verify-otp', async (req, res) => {
  const { email, otp, role } = req.body;
  try {
    if (role !== 'jobseeker') {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Find the OTP in the database
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      role,
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // Check if OTP is not expired
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// Add these new routes
router.post("/send-otp", authController.sendOTP);
router.post("/verify-otp", authController.verifyOTP);
router.post("/check-new-jobseeker", authController.checkNewJobseeker);
router.post("/login-verify-otp", authController.verifyLoginOTP);

// Save a job for later
router.post('/saved-jobs', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'Job ID is required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.savedJobs.includes(jobId)) {
      return res.status(400).json({ message: 'Job already saved' });
    }
    user.savedJobs.push(jobId);
    await user.save();
    res.json({ message: 'Job saved for later' });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ message: 'Error saving job' });
  }
});

// Get all saved jobs for the logged-in user
router.get('/saved-jobs', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('savedJobs');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ savedJobs: user.savedJobs });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ message: 'Error fetching saved jobs' });
  }
});

// Remove a saved job for the logged-in user
router.delete('/saved-jobs/:jobId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedJobs: jobId } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Job removed from saved jobs.' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing saved job', error: error.message });
  }
});

module.exports = router;