const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminroute');
const jobRoutes = require("./routes/jobs");
const applicationRoutes = require('./routes/applications');
const app = express();
const path = require('path'); // Add this import for path.extname
const fs = require('fs');

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Use the authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// DELETE a job by ID
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log("Received DELETE request for job ID:", jobId);
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test route to confirm backend is running
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});