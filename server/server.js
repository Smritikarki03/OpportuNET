const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminroute');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Use the authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});