const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // Ensure jwt is imported (already used in the schema)

const userSchema = new mongoose.Schema({
  name: { type: String },
  fname: { type: String },
  lname: { type: String },
  username: { type: String },
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
  isProfileViewed: { type: Boolean, default: false }, // Add this field
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

module.exports = mongoose.model('User', userSchema);