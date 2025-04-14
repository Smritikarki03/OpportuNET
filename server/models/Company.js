const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String, required: true },
  location: { type: String, required: true },
  establishedDate: { type: Date, required: true },
  description: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  logo: { type: String },
  employeeCount: { type: Number },
  website: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);