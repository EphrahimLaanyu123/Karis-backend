const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, trim: true },
  // Add other fields as needed, e.g., name, role, etc.
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
