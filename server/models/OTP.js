const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  otp: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['jobseeker', 'employer'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Document will be automatically deleted after 5 minutes
  }
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP; 