const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true
    },
    role: {
        type: String,
        enum: ['employer', 'jobseeker'],
        required: true
    },
    company: {
        type: String,
        required: function() {
            return this.role === 'employer';
        }
    }
}, {
    timestamps: true
});

// Hash the password before saving
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

// Generate auth token
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    return token;
};

// Hide private data
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    
    return userObject;
};

module.exports = mongoose.model('User', userSchema); 