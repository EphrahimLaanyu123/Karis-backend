// models/attendees.js
const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Replace 'User' with your actual user model name
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Event',
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
});

const Attendee = mongoose.model('Attendee', attendeeSchema);

module.exports = Attendee;
