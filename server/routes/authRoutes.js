const express = require("express");
const { register, login, employerRegister, forgotPassword, resetPassword, updateProfileViewed, userInfo } = require("../controllers/authController");
const { assignEmployerRole } = require("../middleware/authMiddleware");
const authenticate = require("../middleware/authMiddleware").authenticate;

const router = express.Router();

// Authentication Routes
router.post("/register", register);
router.post("/employerRegister", assignEmployerRole, employerRegister);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/userInfo", authenticate, userInfo);
router.post("/updateProfileViewed", authenticate, updateProfileViewed);

module.exports = router;
