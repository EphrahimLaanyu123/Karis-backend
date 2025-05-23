require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('/home/user/projects/newnext/routes/userRoutes.js'); // Add this

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_ATLAS_URI;

app.use(express.json()); // To parse JSON request bodies

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('MongoDB connection error:', err));

// Use user routes under /api/users
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
