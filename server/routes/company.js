const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const Review = require('../models/Review');
const { authenticate } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer setup for logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../Uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG files are allowed'), false);
    }
  },
});

// Create or update company profile
router.post('/', authenticate, upload.single('logo'), async (req, res) => {
  try {
    const { name, industry, location, establishedDate, description, employeeCount, website } = req.body;
    const userId = req.user.id;

    if (!name || !industry || !location || !establishedDate || !description) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'employer' || !user.isApproved) {
      return res.status(403).json({ message: 'Only approved employers can create a company profile' });
    }

    let company = await Company.findOne({ userId });
    const companyData = {
      name,
      industry,
      location,
      establishedDate: new Date(establishedDate),
      description,
      userId,
      employeeCount: employeeCount ? parseInt(employeeCount) : undefined,
      website,
    };

    if (req.file) {
      companyData.logo = `/Uploads/${req.file.filename}`;
    }

    if (company) {
      Object.assign(company, companyData);
      await company.save();
      return res.status(200).json({ message: 'Company profile updated', company });
    }

    company = new Company(companyData);
    await company.save();

    // Update user's companyId
    await User.findByIdAndUpdate(userId, { companyId: company._id });

    res.status(201).json({ message: 'Company profile created', company });
  } catch (err) {
    console.error('Error creating/updating company:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get company profile for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const company = await Company.findOne({ userId }).populate('userId', 'name email');
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }
    res.json(company);
  } catch (err) {
    console.error('Error fetching company:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get company profile by company ID (public)
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('userId', 'name email');
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    const user = await User.findById(company.userId);
    if (user.role === 'employer' && !user.isApproved) {
      return res.status(403).json({ message: 'Company profile not approved' });
    }
    res.json(company);
  } catch (err) {
    console.error('Error fetching company:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update company profile by ID
router.put('/:id', authenticate, upload.single('logo'), async (req, res) => {
  try {
    const { name, industry, location, establishedDate, description, employeeCount, website } = req.body;
    const userId = req.user.id;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    if (company.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const companyData = {
      name: name || company.name,
      industry: industry || company.industry,
      location: location || company.location,
      establishedDate: establishedDate ? new Date(establishedDate) : company.establishedDate,
      description: description || company.description,
      employeeCount: employeeCount ? parseInt(employeeCount) : company.employeeCount,
      website: website || company.website,
    };

    if (req.file) {
      companyData.logo = `/Uploads/${req.file.filename}`;
    }

    Object.assign(company, companyData);
    await company.save();
    res.json({ message: 'Company profile updated', company });
  } catch (err) {
    console.error('Error updating company:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete company profile
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    if (company.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Company.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(userId, { companyId: null });
    res.json({ message: 'Company profile deleted successfully' });
  } catch (err) {
    console.error('Error deleting company:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Submit a review
router.post('/reviews', authenticate, async (req, res) => {
  try {
    const { companyId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!companyId || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const user = await User.findById(userId);
    const review = new Review({
      companyId,
      userId,
      userName: user.name,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get reviews for a company
router.get('/reviews/:companyId', async (req, res) => {
  try {
    const reviews = await Review.find({ companyId: req.params.companyId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;