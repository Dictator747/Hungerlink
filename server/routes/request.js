const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const { authenticate } = require('../middleware/auth');

// Create a request
router.post('/', authenticate, async (req, res) => {
  try {
    const request = new Request({ ...req.body, user: req.user._id });
    await request.save();
    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all requests for a user
router.get('/my', authenticate, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all requests
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().populate('user');
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update request status
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const request = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
