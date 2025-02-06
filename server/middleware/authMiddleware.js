const jwt = require('jsonwebtoken');

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token' });
  }
};

// Middleware to assign employee role automatically
const assignEmployerRole = (req, res, next) => {
  req.body.role = "employer"; // Automatically assign the role as "doctor"
  next();
};

module.exports = {
  authenticate,
  assignEmployerRole,
};