const mongoose = require('mongoose');
const User = require('../server/models/User');
const Application = require('../server/models/Application');
const Job = require('../server/models/Job');

const MONGO_URI = 'mongodb://localhost:27017/YOUR_DB_NAME'; // <-- Change this to your DB

async function fixAppliedJobs() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const users = await User.find({ 'appliedJobs.0': { $exists: true } });
  let updatedUsers = 0;

  for (const user of users) {
    let changed = false;
    for (const appliedJob of user.appliedJobs) {
      // Skip if already has applicationId and jobId
      if (appliedJob.applicationId && appliedJob.jobId) continue;

      // Find the job by title and company
      const job = await Job.findOne({ title: appliedJob.role, company: appliedJob.company });
      if (!job) continue;

      // Find the application by jobId and userId
      const application = await Application.findOne({ jobId: job._id, userId: user._id });
      if (!application) continue;

      // Update fields if missing
      if (!appliedJob.jobId) {
        appliedJob.jobId = job._id;
        changed = true;
      }
      if (!appliedJob.applicationId) {
        appliedJob.applicationId = application._id;
        changed = true;
      }
    }
    if (changed) {
      await user.save();
      updatedUsers++;
    }
  }

  console.log(`Updated ${updatedUsers} users' appliedJobs with jobId and applicationId.`);
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

fixAppliedJobs().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
}); 