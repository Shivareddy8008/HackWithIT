const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Mock sending OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });
  
  // In a real app, integrate Twilio/Firebase here
  console.log(`Mock OTP sent to ${phone}: 1234`);
  res.json({ message: 'OTP sent successfully (mock: use 1234)' });
});

// Verify OTP & Login/Register
router.post('/verify-otp', async (req, res) => {
  const { phone, otp, username } = req.body;
  
  if (otp !== '1234') {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  try {
    let user = await User.findOne({ phone });
    if (!user) {
      if (!username) return res.status(400).json({ error: 'Username required for new users' });
      user = new User({ phone, username, avatarId: Math.floor(Math.random() * 5) + 1 });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id, phone: user.phone }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
