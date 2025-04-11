const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminroute');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const Company = require('./models/Company');
const Job = require('./models/Job');
const { authenticate } = require('./middleware/authMiddleware');
const app = express();
const path = require('path');
const fs = require('fs');
const companyRoutes = require('./routes/company');
const multer = require('multer');

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// POST /api/company - Create or update company profile
app.post('/api/company', authenticate, upload.single('logo'), async (req, res) => {
  try {
    const { name, industry, location, employeeCount, description, website } = req.body;
    const userId = req.user.id;

    if (!name || !industry || !location || !employeeCount || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let company = await Company.findOne({ userId });
    const companyData = {
      userId,
      name,
      industry,
      location,
      employeeCount: parseInt(employeeCount),
      description,
      website,
    };

    if (req.file) {
      companyData.logo = `/uploads/${req.file.filename}`;
    }

    if (company) {
      Object.assign(company, companyData);
      await company.save();
      return res.status(200).json(company);
    }

    company = new Company(companyData);
    await company.save();
    res.status(201).json(company);
  } catch (err) {
    console.error('Error creating/updating company:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/company - Fetch company profile
app.get('/api/company', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const company = await Company.findOne({ userId });
    res.status(200).json(company || {});
  } catch (err) {
    console.error('Error fetching company:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/company/exists - Check if a company exists for the authenticated user
app.get('/api/company/exists', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const company = await Company.findOne({ userId });
    res.status(200).json({ exists: !!company });
  } catch (err) {
    console.error('Error checking company existence:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/company/reviews - Add a review to the company
app.post('/api/company/reviews', authenticate, async (req, res) => {
  try {
    const { user, comment, rating } = req.body;
    const userId = req.user.id;

    if (!user || !comment || !rating) {
      return res.status(400).json({ message: 'User, comment, and rating are required' });
    }

    const company = await Company.findOne({ userId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.reviews.push({ user, comment, rating: parseInt(rating) });
    await company.save();

    res.status(201).json({ message: 'Review added successfully' });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/company/reviews/:reviewIndex - Update a review
app.put('/api/company/reviews/:reviewIndex', authenticate, async (req, res) => {
  try {
    const { reviewIndex } = req.params;
    const { user, comment, rating } = req.body;
    const userId = req.user.id;

    if (!user || !comment || !rating) {
      return res.status(400).json({ message: 'User, comment, and rating are required' });
    }

    const company = await Company.findOne({ userId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (reviewIndex < 0 || reviewIndex >= company.reviews.length) {
      return res.status(404).json({ message: 'Review not found' });
    }

    company.reviews[reviewIndex] = { user, comment, rating: parseInt(rating) };
    await company.save();

    res.status(200).json({ message: 'Review updated successfully' });
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/company/reviews/:reviewIndex - Delete a review
app.delete('/api/company/reviews/:reviewIndex', authenticate, async (req, res) => {
  try {
    const { reviewIndex } = req.params;
    const userId = req.user.id;

    const company = await Company.findOne({ userId });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (reviewIndex < 0 || reviewIndex >= company.reviews.length) {
      return res.status(404).json({ message: 'Review not found' });
    }

    company.reviews.splice(reviewIndex, 1);
    await company.save();

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Use the authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/company', companyRoutes);

// DELETE a job by ID
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    console.log('Received DELETE request for job ID:', jobId);
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.status(200).json({ message: 'Job deleted successfully' });
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