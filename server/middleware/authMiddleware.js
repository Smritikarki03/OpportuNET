const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate user
const authenticate = async (req, res, next) => {
  try {
    console.log('Auth Middleware - Headers:', req.headers);
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('Auth Middleware - No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    console.log('Auth Middleware - Token received:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth Middleware - Decoded token:', decoded);

    const user = await User.findById(decoded.id);
    console.log('Auth Middleware - User found:', {
      id: user?._id,
      role: user?.role,
      email: user?.email
    });

    if (!user) {
      console.log('Auth Middleware - User not found');
      return res.status(401).json({ message: 'User not found' });
    }

    // Store the complete user object
    req.user = user;
    console.log('Auth Middleware - User set on request:', {
      id: req.user._id,
      role: req.user.role
    });
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid token' });
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
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.role.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = {
  authenticate,
  assignEmployerRole,
  authenticateAdmin,
};