const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);

// ... existing routes ...

module.exports = app; 