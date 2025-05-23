// fixJobs.js
const mongoose = require('mongoose');
const Job = require('./models/Job'); // Adjust path to your Job model
const User = require('./models/User'); // Adjust path to your User model
const Application = require('./models/Application');

const MONGO_URI = 'mongodb://localhost:27017/opportunet'; // Change if your DB name is different

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function updateJobs() {
  try {
    // Find all jobs missing userId
    const jobsWithoutUserId = await Job.find({
      $or: [
        { userId: { $exists: false } },
        { userId: null },
      ],
    });
    console.log(`Found ${jobsWithoutUserId.length} jobs without userId`);

    // Update each job by matching the company field to an employer's companyName
    let updatedCount = 0;
    for (const job of jobsWithoutUserId) {
      const employer = await User.findOne({
        role: 'employer',
        companyName: job.company,
      });

      if (employer) {
        await Job.updateOne(
          { _id: job._id },
          { $set: { userId: employer._id } }
        );
        console.log(`Updated job ${job._id} with userId ${employer._id} (Company: ${job.company})`);
        updatedCount++;
      } else {
        console.log(`No employer found for job ${job._id} (Company: ${job.company})`);
      }
    }

    console.log(`Migration completed successfully. Updated ${updatedCount} jobs.`);
  } catch (error) {
    console.error('Error updating jobs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

async function fixApplicationStatuses() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Update embedded applications in jobs
  const jobResult = await Job.updateMany(
    { 'applications.status': 'PENDING' },
    { $set: { 'applications.$[elem].status': 'APPLIED' } },
    { arrayFilters: [ { 'elem.status': 'PENDING' } ] }
  );
  console.log('Updated jobs:', jobResult.modifiedCount);

  // Update standalone applications
  const appResult = await Application.updateMany(
    { status: 'PENDING' },
    { $set: { status: 'APPLIED' } }
  );
  console.log('Updated applications:', appResult.modifiedCount);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

updateJobs();
fixApplicationStatuses().catch(err => {
  console.error('Error updating statuses:', err);
  process.exit(1);
});