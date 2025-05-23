require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_ATLAS_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');

  // ✅ Import model only after connection
  const User = require('./models/User');

  // ✅ Now you can use User.findOne safely
  app.post('/register', async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) return res.status(400).json({ message: 'User already exists' });

      // create and save new user
      const newUser = new User({
        email: req.body.email,
        password: req.body.password,
      });

      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error('❌ Registration Error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Start the server after DB connection and routes
  app.listen(process.env.PORT, () =>
    console.log(`🚀 Server is running on port ${process.env.PORT}`)
  );
})
.catch((err) => {
  console.error('❌ Failed to connect to MongoDB Atlas:', err);
});
