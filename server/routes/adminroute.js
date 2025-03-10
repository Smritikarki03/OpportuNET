const express = require("express");
const { adminApproveRejectEmployer, getNotifications, markNotificationAsRead } = require("../controllers/adminController");
const authenticate = require("../middleware/authMiddleware").authenticate;

const router = express.Router();

// Admin Routes
router.post("/approve-reject", authenticate, adminApproveRejectEmployer);
router.get("/notifications", authenticate, getNotifications);
router.patch("/notifications/:id", authenticate, markNotificationAsRead);

module.exports = router;
