const mongoose = require('mongoose');

const attendeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  numberOfTickets: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  }
}, { timestamps: true });

// Prevent duplicate bookings for same user & event
attendeeSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Attendee', attendeeSchema);
