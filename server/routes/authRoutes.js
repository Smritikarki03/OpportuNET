const express = require('express');
const { register, login, employerRegister, forgotPassword, resetPassword, updateProfileViewed } = require('../controllers/authController');
const { assignEmployerRole } = require('../middleware/authMiddleware');
const authenticate = require('../middleware/authMiddleware').authenticate;

const router = express.Router();

// POST route for user 
router.post('/register', register);
router.post('/employerRegister', assignEmployerRole, employerRegister);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/updateProfileViewed', authenticate, updateProfileViewed);

module.exports = router;
