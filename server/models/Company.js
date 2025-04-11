const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
});

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String, required: true },
  location: { type: String, required: true },
  employeeCount: { type: Number, required: true },
  description: { type: String, required: true },
  logo: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviews: [reviewSchema],
});

module.exports = mongoose.model('Company', companySchema);