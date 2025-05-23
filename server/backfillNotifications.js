const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');

const MONGO_URI = 'mongodb://localhost:27017/YOUR_DB_NAME'; // <-- Change this to your DB

async function backfill() {
  await mongoose.connect(MONGO_URI);

  // Find the admin user
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.log('No admin user found!');
    process.exit(1);
  }

  // Find all pending employers
  const pendingEmployers = await User.find({ role: 'employer', isApproved: false });

  for (const employer of pendingEmployers) {
    // Check if notification already exists
    const exists = await Notification.findOne({ employerId: employer._id, adminId: admin._id });
    if (!exists) {
      await Notification.create({
        message: `A new Employer ${employer.name} has registered and is awaiting approval.`,
        adminId: admin._id,
        employerId: employer._id,
        read: false,
        type: 'message'
      });
      console.log(`Notification created for employer: ${employer.name}`);
    }
  }

  console.log('Backfill complete!');
  process.exit(0);
}

backfill(); 