const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const Review = require('../models/Review');
const { authenticate } = require('../middleware/authMiddleware');
const path = require('path');
const upload = require('../middleware/upload');

// Get all companies (this needs to be before parameterized routes)
router.get('/all', async (req, res) => {
  try {
    // Fetch all companies from database with complete information
    const companies = await Company.find()
      .populate('userId', 'name email')
      .select('name industry location establishedDate description logo employeeCount website createdAt')
      .sort({ createdAt: -1 });

    // Get reviews for each company
    const companiesWithReviews = await Promise.all(companies.map(async (company) => {
      const reviews = await Review.find({ companyId: company._id });
      const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

      return {
        ...company.toObject(),
        averageRating: parseFloat(averageRating),
        totalReviews: reviews.length
      };
    }));

    res.json(companiesWithReviews);
  } catch (err) {
    console.error('Error fetching all companies:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
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
      
      // Update user's companyId and set isCompanySetup to true
      await User.findByIdAndUpdate(userId, { 
        companyId: company._id,
        isCompanySetup: true 
      });
      
      return res.status(200).json({ message: 'Company profile updated', company });
    }

    company = new Company(companyData);
    await company.save();

    // Update user's companyId and set isCompanySetup to true
    await User.findByIdAndUpdate(userId, { 
      companyId: company._id,
      isCompanySetup: true 
    });

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
router.get('/:id', authenticate, async (req, res) => {
  try {
    console.log('Fetching company with ID:', req.params.id);
    console.log('Authenticated user:', req.user.id);

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Convert to plain object and ensure userId is a string
    const companyData = company.toObject();
    companyData.userId = company.userId.toString();

    console.log('Sending company data:', {
      companyId: companyData._id,
      userId: companyData.userId,
      requestUserId: req.user.id
    });

    res.json(companyData);
  } catch (err) {
    console.error('Error fetching company:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update company profile by ID
router.put('/:id', authenticate, upload.single('logo'), async (req, res) => {
  try {
    console.log('Update request received:', {
      userId: req.user.id,
      companyId: req.params.id,
      body: req.body
    });

    // Find the company
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    // Check ownership
    if (company.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this company profile' });
    }

    // Prepare update data
    const updateData = {
      name: req.body.name,
      industry: req.body.industry,
      location: req.body.location,
      establishedDate: req.body.establishedDate,
      employeeCount: req.body.employeeCount,
      website: req.body.website,
      description: req.body.description
    };

    if (req.file) {
      updateData.logo = `/Uploads/${req.file.filename}`;
    }

    console.log('Updating company with data:', updateData);

    // Update the company with new: true to return the updated document
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found after update' });
    }

    console.log('Company updated successfully:', updatedCompany);

    // Return the updated company data
    res.json({
      success: true,
      message: 'Company profile updated successfully',
      company: updatedCompany
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating company profile',
      error: error.message
    });
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

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;