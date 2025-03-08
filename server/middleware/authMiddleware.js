const jwt = require('jsonwebtoken');
const userModel = require('../models/User');  // Ensure the path is correct

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract the token

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the token
    req.user = decoded; // Attach decoded user info to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};

// Middleware to assign Employer role automatically during registration
const assignEmployerRole = (req, res, next) => {
  req.body.role = "employer"; // Automatically assign the role as "Employer"
  next();
};

// Middleware to authenticate admin and verify role
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from header

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Decode the token using JWT_SECRET from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by decoded ID
    const user = await userModel.findById(decoded.id);  // Ensure you're matching `decoded.id` with the `_id` field

    // If user doesn't exist
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed. User not found.' });
    }

    // Check if the user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to access this route.' });
    }

    // Attach the user to the request object for further processing
    req.user = user;
    next(); // Allow the request to continue

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
  }
};

module.exports = {
  authenticate,
  assignEmployerRole,
  authenticateAdmin,
};