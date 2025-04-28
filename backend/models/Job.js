const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    requirements: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        required: true
    },
    experienceLevel: {
        type: String,
        required: true
    },
    noOfPositions: {
        type: Number,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Active'
    },
    deadline: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    }]
}, {
    timestamps: true // This will automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('Job', jobSchema); 