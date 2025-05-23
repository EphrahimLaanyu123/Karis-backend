const express = require('express');
const router = express.Router();
const Attendee = require('../models/attendee');
const Event = require('../models/event');
const User = require('../models/user');

// POST /api/attendees/book
router.post('/book', async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    if (!userId || !eventId) {
      return res.status(400).json({ message: 'userId and eventId are required.' });
    }

    // Check if user and event exist
    const user = await User.findById(userId);
    const event = await Event.findById(eventId);

    if (!user || !event) {
      return res.status(404).json({ message: 'User or Event not found.' });
    }

    if (event.remainingTickets <= 0) {
      return res.status(400).json({ message: 'No tickets available.' });
    }

    // Check if already booked
    const existing = await Attendee.findOne({ user: userId, event: eventId });
    if (existing) {
      return res.status(400).json({ message: 'User already booked this event.' });
    }

    // Book the ticket
    const attendee = new Attendee({ user: userId, event: eventId });
    await attendee.save();

    // Update remaining tickets
    event.remainingTickets -= 1;
    await event.save();

    res.status(201).json({ message: 'Booking successful', attendee });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendees/:eventId
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const attendees = await Attendee.find({ event: eventId }).populate('user', 'email');
    res.status(200).json(attendees);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
