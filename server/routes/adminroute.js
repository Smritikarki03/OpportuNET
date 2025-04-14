const express = require("express");
const { adminApproveRejectEmployer, getNotifications, markNotificationAsRead, getUserStats } = require("../controllers/adminController");
const {authenticateAdmin} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin Routes
router.post("/approve-reject", authenticateAdmin, adminApproveRejectEmployer);
router.get("/notifications", authenticateAdmin, getNotifications);
router.patch("/notifications/:id", authenticateAdmin, markNotificationAsRead);
// Protect this route with admin authentication
router.get("/user-stats", authenticateAdmin, getUserStats);

module.exports = router;
