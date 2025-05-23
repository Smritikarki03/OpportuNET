const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Get all reviews (for admin)
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name email')
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

// Submit a review
router.post('/', authenticate, async (req, res) => {
  try {
    const { companyId, rating, comment } = req.body;
    const userId = req.user.id;

    console.log('Review submission started:', {
      companyId,
      userId,
      rating,
      comment,
      userName: req.user.name
    });

    // Get the company details to find the owner
    const company = await Company.findById(companyId).populate('userId');
    console.log('Company found:', {
      companyId: company?._id,
      companyName: company?.name,
      ownerId: company?.userId?._id,
      ownerName: company?.userId?.name
    });

    if (!company) {
      console.log('Company not found:', companyId);
      return res.status(404).json({ message: 'Company not found' });
    }

    if (!company.userId) {
      console.log('Company has no owner:', company._id);
      return res.status(400).json({ message: 'Company has no assigned owner' });
    }

    // Create the review
    const review = new Review({
      companyId,
      userId,
      rating,
      comment,
      userName: req.user.name
    });

    await review.save();
    console.log('Review saved:', {
      reviewId: review._id,
      companyId: review.companyId,
      reviewerId: review.userId,
      reviewerName: req.user.name
    });

    try {
      // Create notification for company owner
      const notification = new Notification({
        recipient: company.userId._id || company.userId,
        message: `${req.user.name} left a ${rating}-star review for your company: "${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}"`,
        companyId: company._id,
        type: 'review'
      });

      await notification.save();
      console.log('Notification created:', {
        notificationId: notification._id,
        recipientId: notification.recipient,
        message: notification.message
      });

      // Send immediate response
      res.status(201).json({ 
        review,
        message: 'Review submitted successfully',
        notificationCreated: true
      });
    } catch (notificationError) {
      console.error('Error creating notification:', {
        error: notificationError.message,
        stack: notificationError.stack,
        companyId: company._id,
        ownerId: company.userId._id || company.userId
      });
      
      // Still send success response for review
      res.status(201).json({ 
        review,
        message: 'Review submitted successfully, but notification failed',
        notificationCreated: false
      });
    }
  } catch (error) {
    console.error('Error in review submission:', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Error submitting review', error: error.message });
  }
});

// Get reviews for a company
router.get('/company/:companyId', async (req, res) => {
  try {
    const reviews = await Review.find({ companyId: req.params.companyId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Update a review
router.put('/:reviewId', authenticate, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    console.log('Update review request:', {
      reviewId,
      body: req.body,
      userId: req.user.id,
      headers: req.headers
    });

    // Validate reviewId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      console.log('Invalid review ID format:', reviewId);
      return res.status(400).json({ message: 'Invalid review ID format' });
    }

    const { rating, comment } = req.body;
    const review = await Review.findById(reviewId);

    console.log('Found review:', {
      review,
      reviewId,
      reviewUserId: review?.userId?.toString(),
      currentUserId: req.user.id
    });

    if (!review) {
      console.log('Review not found for ID:', reviewId);
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user is the creator of the review
    if (review.userId.toString() !== req.user.id) {
      console.log('Unauthorized: Review creator does not match current user', {
        reviewUserId: review.userId.toString(),
        currentUserId: req.user.id
      });
      return res.status(403).json({ message: 'Unauthorized to edit this review' });
    }

    // Update the review
    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Return the updated review with populated fields
    const updatedReview = await Review.findById(reviewId)
      .populate('userId', 'name')
      .populate('companyId', 'name');

    console.log('Successfully updated review:', updatedReview);
    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', {
      error: error.message,
      stack: error.stack,
      reviewId: req.params.reviewId
    });
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

// Delete a review
router.delete('/:reviewId', authenticate, async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    // Validate reviewId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID format' });
    }
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    // Only the author can delete
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this review' });
    }
    await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

module.exports = router; 