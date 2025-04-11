const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Consolidated name field (remove fname, lname, username)
  bio: { type: String }, // For user bio
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: {
    type: String,
    enum: ["employer", "jobseeker", "admin"],
    default: "jobseeker",
  },
  isApproved: { type: Boolean, default: false }, // For employer approval
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isProfileViewed: { type: Boolean, default: false },
  isCompanySetup: { type: Boolean, default: false }, // Optional: Keep to track company setup
  skills: [{ type: String }], // Array of skills
  image: { type: String }, // Path to profile image
  resume: { type: String }, // Path to resume file
  appliedJobs: [{ // For tracking applied jobs
    date: String,
    role: String,
    company: String,
    status: String,
  }],
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, email: this.email, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;