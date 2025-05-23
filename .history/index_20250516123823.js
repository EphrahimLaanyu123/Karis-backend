require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes'); // Adjusted path
const adminRoutes = require('./routes/adminRoutes'); // Add this

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_ATLAS_URI;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes); // Mount admin routes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
