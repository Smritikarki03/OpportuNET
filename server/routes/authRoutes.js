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
// New route for company setup
router.post("/setup-company", authenticate, async (req, res) => {
  try {
    const { name, industry, location, logo, description, website } = req.body;
    const userId = req.user.id; // From auth middleware

    const user = await userModel.findById(userId);
    if (!user || user.role !== "employer") {
      return res.status(404).json({ message: "Employer not found" });
    }

    // Update company details
    user.companyName = name;
    user.industry = industry;
    user.companyLocation = location;
    user.logo = logo; // Add logo field to userModel if not already present
    user.description = description; // Add description field to userModel if not already present
    user.website = website; // Add website field to userModel if not already present
    user.isCompanySetup = true;

    await user.save();

    res.status(200).json({ success: true, message: "Company setup successful", user });
  } catch (error) {
    console.error("Company setup error:", error);
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

module.exports = router;
