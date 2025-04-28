const mongoose = require('mongoose');

const companyReviewSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add compound index to prevent duplicate reviews
companyReviewSchema.index({ companyId: 1, userId: 1 }, { unique: true });

const CompanyReview = mongoose.model('CompanyReview', companyReviewSchema);

module.exports = CompanyReview; 