const express = require("express");
const { register, login, employerRegister, forgotPassword, resetPassword, updateProfileViewed, userInfo } = require("../controllers/authController");
const { assignEmployerRole } = require("../middleware/authMiddleware");
const authenticate = require("../middleware/authMiddleware").authenticate;
const multer = require('multer');
const userModel = require('../models/User'); // Adjust the path to your User model
const path = require('path');
const Job = require('../models/Job'); // Make sure to import the Job model



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


// In your userInfo route handler
router.get('/userInfo', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let userData = user.toObject();

    // If the user is an employer, fetch their posted jobs
    if (user.role === 'employer') {
      const postedJobs = await Job.find({ userId: user._id })
        .select('title location salary status _id')
        .sort({ createdAt: -1 });
      
      userData.postedJobs = postedJobs;
    }

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ message: 'Error fetching user information' });
  }
});

module.exports = router;