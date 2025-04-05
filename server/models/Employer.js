const express = require("express");
const router = express.Router();
const Employer = require("../models/Employer");
const Company = require("../models/Company");

// // Check employer status (isCompanySetup)
// router.get("/:id", async (req, res) => {
//   try {
//     const employer = await Employer.findById(req.params.id);
//     if (!employer) return res.status(404).json({ message: "Employer not found" });

//     res.json({ isCompanySetup: employer.isCompanySetup });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });

// Setup company profile
router.post("/setup-company", async (req, res) => {
  try {
    const { employerId, name, industry, location, logo, description, website } = req.body;

    // Check if employer exists
    const employer = await Employer.findById(employerId);
    if (!employer) return res.status(404).json({ message: "Employer not found" });

    // Create company profile
    const newCompany = new Company({
      name,
      industry,
      location,
      logo,
      description,
      website,
      employer: employerId,
    });

    await newCompany.save();

    // Update employer's profile to link to company and set company setup flag
    employer.company = newCompany._id;
    employer.isCompanySetup = true;
    await employer.save();

    res.status(201).json({ message: "Company setup successful", company: newCompany });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;