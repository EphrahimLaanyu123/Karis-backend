const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add other fields as needed
});

module.exports = mongoose.model('User', userSchema);
