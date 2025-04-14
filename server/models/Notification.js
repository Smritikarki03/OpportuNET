const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who will see this notification
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Employer being approved/rejected
});

// Create a method to populate the notification with necessary user info
notificationSchema.methods.populateUserInfo = function() {
  return this.populate([
    { path: 'adminId', select: 'name email phone' },
    { path: 'employerId', select: 'name email phone companyName industry' }
  ]);
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;