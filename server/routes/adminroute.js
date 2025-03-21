const express = require("express");
const { adminApproveRejectEmployer, getNotifications, markNotificationAsRead } = require("../controllers/adminController");
const {authenticateAdmin} = require("../middleware/authMiddleware");

const router = express.Router();

// Admin Routes
router.post("/approve-reject", authenticateAdmin, adminApproveRejectEmployer);
router.get("/notifications", authenticateAdmin, getNotifications);
router.patch("/notifications/:id", authenticateAdmin, markNotificationAsRead);

module.exports = router;
