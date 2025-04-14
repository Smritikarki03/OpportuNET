const jwt = require('jsonwebtoken');
const userModel = require('../models/User');

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(400).json({ message: 'Invalid token: Missing user ID.' });
    }

    // Check if the user exists in the database
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User ID not found. Please log in again.' });
    }

    // Attach user info to the request
    req.user = { id: decoded.id, role: user.role }; // Include role for role-based checks
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

// Middleware to assign Employer role automatically during registration
const assignEmployerRole = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing.' });
  }
  req.body.role = 'employer';
  next();
};

// Middleware to authenticate admin and verify role
const authenticateAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(400).json({ message: 'Invalid token: Missing user ID.' });
    }

    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to access this route.' });
    }

    req.user = { id: decoded.id, role: user.role };
    next();
  } catch (error) {
    console.error('Admin authentication error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
  }
};

module.exports = {
  authenticate,
  assignEmployerRole,
  authenticateAdmin,
};