const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Consolidated name field
  bio: { type: String }, // For user bio (job seekers)
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
  skills: [{ type: String }], // Array of skills (for both job seekers and employers)
  image: { type: String }, // Path to profile image
  resume: { type: String }, // Path to resume file (or CV for employers)
  appliedJobs: [
    {
      date: String,
      role: String,
      company: String,
      status: String,
    },
  ], // For job seekers
  // Fields for employers (as per the screenshot)
  companyName: { type: String }, // e.g., "Leapfrog Private Limited"
  location: { type: String }, // e.g., "Kathmandu, Nepal"
  experienceLevel: { type: String }, // e.g., "Senior"
  education: { type: String }, // e.g., "MBA in Human Resources"
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

  jobApplicants: [
    {
      id: { type: String, required: true }, // Unique ID for the applicant
      name: { type: String, required: true }, // Applicant's name
      jobRole: { type: String, required: true }, // Job role applied for
      cv: { type: String }, // Path to applicant's CV
      status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED"],
        default: "PENDING",
      },
    },
  ], // For employers
}, { timestamps: true });

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, email: this.email, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;