const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicantName: { type: String, required: true },
  coverLetter: { type: String },
  resume: { type: String, required: true }, // Path to the resume file
  coverLetterFile: { type: String }, // Path to the cover letter file (optional)
  status: { 
    type: String, 
    enum: [
      'APPLIED',
      'REVIEWED',
      'SHORTLISTED',
      'INTERVIEW_SCHEDULED',
      'INTERVIEWED',
      'ACCEPTED',
      'REJECTED'
    ],
    default: 'APPLIED'
  },
  interviewTime: { type: Date }, // Interview time for accepted applications
  appliedDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  totalApplicants: { type: Number, default: 0 },
  archived: { type: Boolean, default: false }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
