const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminroute');
const jobRoutes = require("./routes/jobs");
const app = express();
// const companiesRoutes = require('./routes/companies'); // Add this line
// const path = require('path');  // Add this line
const mongoose = require('mongoose');
const applicationRoutes = require('./routes/applications'); // Add this

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// // // Create uploads directory if it doesn't exist
// const fs = require('fs');
// const uploadsDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// Use the authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes); // Add job routes
// app.use('/api/companies', companiesRoutes); 
app.use('/api/applications', applicationRoutes); // Add application routes
// DELETE a job by ID
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log("Received DELETE request for job ID:", jobId); // Add this for debugging
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// // MongoDB connection
// mongoose.connect('mongodb://localhost:27017/opportunet', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.error('MongoDB connection error:', err));

// Test route to confirm backend is running
app.get('/', (req, res) => {
    res.send('Backend is running!');
  });


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});