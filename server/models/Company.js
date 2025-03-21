const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String, required: true },
  location: { type: String, required: true },
  logo: { type: String },
  description: { type: String },
  website: { type: String },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: "Employer" }
});

module.exports = mongoose.model("Company", companySchema);
