// models/Attendee.js
const mongoose = require('mongoose');

const AttendeeSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // You should have a User model already
    required: true,
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Attendee', AttendeeSchema);
