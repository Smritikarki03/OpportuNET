const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  jobType: {
    type: String,
    required: true
  },
  experienceLevel: {
    type: String,
    required: true
  },
  noOfPositions: {
    type: Number,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Virtual property to check if job posting is expired
jobSchema.virtual('isExpired').get(function() {
  return this.deadline < new Date();
});

// Include virtuals when converting document to JSON
jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Job', jobSchema);