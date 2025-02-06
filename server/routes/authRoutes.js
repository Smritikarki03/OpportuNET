const express = require('express');
const { register,login, employerRegister, forgotPassword, resetPassword } = require('../controllers/authController');
const {assignEmployerRole} = require('../middleware/authMiddleware');

const router = express.Router();

// POST route for user 
router.post('/register', register);
router.post('/employerRegister', assignEmployerRole, employerRegister);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


module.exports = router;