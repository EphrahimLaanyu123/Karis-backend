// routes/attendeeRoutes.js
const express = require('express');
const router = express.Router();

const Attendee = require('../models/Attendee');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

// POST /api/attendees/book/:eventId
router.post('/book/:eventId', async (req, res) => {
  const { userId } = req.body;
  const { eventId } = req.params;

  if (!userId || !eventId) {
    return res.status(400).json({ message: 'userId and eventId are required' });
  }

  try {
    // Find ticket associated with event
    const ticket = await Ticket.findOne({ event: eventId });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket for this event not found' });
    }

    if (ticket.bookedTickets >= ticket.totalTickets) {
      return res.status(400).json({ message: 'No more tickets available' });
    }

    // Check if user has already booked this event
    const alreadyBooked = await Attendee.findOne({ event: eventId, user: userId });
    if (alreadyBooked) {
      return res.status(400).json({ message: 'You have already booked a ticket for this event' });
    }

    // Create new Attendee
    const newAttendee = new Attendee({
      event: eventId,
      user: userId,
      ticket: ticket._id
    });

    await newAttendee.save();

    // Increment booked tickets
    ticket.bookedTickets += 1;
    await ticket.save();

    res.status(201).json({ message: 'Ticket booked and attendee added', attendee: newAttendee });
  } catch (err) {
    console.error('Error booking attendee:', err);
    res.status(500).json({ message: 'Server error while booking ticket' });
  }
});

module.exports = router;
