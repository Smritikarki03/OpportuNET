const express = require('express');
const router = express.Router();
const CompanyReview = require('../models/CompanyReview');
const { authenticate } = require('../middleware/authMiddleware');

// Get all reviews for a company
router.get('/company/:companyId', async (req, res) => {
  try {
    const reviews = await CompanyReview.find({ companyId: req.params.companyId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a new review
router.post('/', authenticate, async (req, res) => {
  try {
    const { companyId, rating, comment } = req.body;
    
    // Check if user has already reviewed this company
    const existingReview = await CompanyReview.findOne({
      companyId,
      userId: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this company' });
    }

    const review = new CompanyReview({
      companyId,
      userId: req.user.id,
      rating,
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update a review
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await CompanyReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.json(review);
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const review = await CompanyReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.remove();
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 