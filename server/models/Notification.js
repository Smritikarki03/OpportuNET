const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  type: {
    type: String,
    enum: ['review', 'application', 'message', 'contact', 'employer_approval'],
    default: 'message'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);