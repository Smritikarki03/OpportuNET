const express = require('express');
const router = express.Router();
const Company = require('../models/Company'); // Assuming you have a Company model

// GET /api/company - Fetch company profile
router.get('/', async (req, res) => {
  try {
    const company = await Company.findOne(); // Fetch the first company for simplicity

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json(company);
  } catch (err) {
    console.error('Error fetching company profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
