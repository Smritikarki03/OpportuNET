const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String},
  fname: { type: String },
  lname: { type: String},
  username: {type: String},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  confirmPassword : {type: String},
  companyName : {type: String},
  industry : {type: String},
  companyLocation : {type: String},
  phone: { type: String},
  practice: { type: String},
  location: { type: String},
  role: {
    type: String,
    enum: ["employer", "jobseeker", "admin"], // Corrected enum values
    default: "jobseeker", // Default role
  },
  resetPasswordToken: String,
    resetPasswordExpires: Date,
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

module.exports = mongoose.model('User', userSchema);