// routes/attendeeRoutes.js
const express = require('express');
const router = express.Router();
const Attendee = require('../models/attendee');
const Event = require('../models/event'); // Assuming you already have this

// POST: Book a ticket
router.post('/book/:eventId', async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  try {
    // Check if user already booked
    const existingBooking = await Attendee.findOne({ userId, eventId });
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this event.' });
    }

    // Check event availability
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const remaining = event.totalTickets - event.bookedTickets;
    if (remaining <= 0) {
      return res.status(400).json({ message: 'No tickets available for this event.' });
    }

    // Book ticket
    const booking = new Attendee({ userId, eventId });
    await booking.save();

    // Update booked tickets count in Event
    event.bookedTickets += 1;
    await event.save();

    res.status(201).json({ message: 'Ticket booked successfully.', booking });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
