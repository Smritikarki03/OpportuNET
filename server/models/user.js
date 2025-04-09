const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String },
  fname: { type: String },
  lname: { type: String },
  username: { type: String },
  bio: { type: String }, // New bio field
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword: { type: String }, // Consider removing this (see note below)
  companyName: { type: String },
  industry: { type: String },
  companyLocation: { type: String },
  phone: { type: String },
  practice: { type: String },
  location: { type: String },
  role: {
    type: String,
    enum: ["employer", "jobseeker", "admin"],
    default: "jobseeker",
  },
  isApproved: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isProfileViewed: { type: Boolean, default: false },
  isCompanySetup: { type: Boolean, default: false },
  // Add fields for editProfile endpoint
  skills: [{ type: String }], // Array of skills
  image: { type: String }, // Path to profile image
  resume: { type: String }, // Path to resume file
  appliedJobs: [{ // For tracking applied jobs
    date: String,
    role: String,
    company: String,
    status: String,
  }],
  // Fields for company setup (already present, but ensuring completeness)
  logo: { type: String }, // For employer company logo
  description: { type: String }, // For employer company description
  website: { type: String }, // For employer company website
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;