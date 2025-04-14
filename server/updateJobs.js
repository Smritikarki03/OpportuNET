// fixJobs.js
const mongoose = require('mongoose');
const Job = require('./models/Job'); // Adjust path to your Job model
const User = require('./models/User'); // Adjust path to your User model

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/FYP', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
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

updateJobs();