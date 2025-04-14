const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminroute');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const companyRoutes = require('./routes/company');
const { authenticate } = require('./middleware/authMiddleware');
const app = express();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('./models/User'); // Your User model


// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'Uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(UploadsDir);
}

// Multer for user profile uploads (image and CV)
const storageProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'Uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const uploadProfile = multer({
  storage: storageProfile,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG and PNG images are allowed'), false);
      }
    } else if (file.fieldname === 'cv') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'), false);
      }
    } else {
      cb(new Error('Unexpected field'), false);
    }
  },
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
]);

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/company', companyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});
// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from DB
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Delete a user by ID
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id); // Delete user by ID
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});