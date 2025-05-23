const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');
const contactRoutes = require('./routes/contact');
const adminRoute = require('./routes/adminroute');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/adminroute', adminRoute);

// ... existing routes ...

module.exports = app; 