const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String, required: true },
  resume: { type: String, required: true }, // Path to the resume file
  createdAt: { type: Date, default: Date.now },
  totalApplicants: { type: Number, default: 0 }
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
