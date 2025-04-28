const checkAdmin = (req, res, next) => {
  if (!req.user || req.user.role.toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

module.exports = checkAdmin; 