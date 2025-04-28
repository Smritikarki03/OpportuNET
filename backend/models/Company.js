const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userName: {
    type: String,
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
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  establishedDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeCount: {
    type: Number,
    required: false
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    default: '/Uploads/default-company-logo.png'
  },
  reviews: [reviewSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Company', companySchema); 