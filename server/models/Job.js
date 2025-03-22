const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: { type: String, required: true },
  salary: { type: Number },
  location: { type: String, required: true },
  jobType: { type: String, required: true },
  experienceLevel: { type: String, required: true },
  noOfPositions: { type: Number, required: true },
  company: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional: Link to the user who posted the job
});

module.exports = mongoose.model('Job', jobSchema);