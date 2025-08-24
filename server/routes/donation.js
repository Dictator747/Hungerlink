const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { authenticate } = require('../middleware/auth');

// Create a donation
router.post('/', authenticate, async (req, res) => {
  try {
    const donation = new Donation({ ...req.body, user: req.user._id });
    await donation.save();
    res.status(201).json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all donations for a user
router.get('/my', authenticate, async (req, res) => {
  try {
    const donations = await Donation.find({ user: req.user._id });
    res.json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all donations
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find().populate('user claimedBy');
    res.json({ success: true, donations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update donation status
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
