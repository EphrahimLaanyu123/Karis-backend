const express = require('express');
const bcrypt = require('bcrypt');
const User = require('/home/user/projects/newnext/models/User.js');
const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  // your signup logic here
});

// Signin route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    // You can add token generation here (JWT) if needed

    res.status(200).json({ message: 'Signed in successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
