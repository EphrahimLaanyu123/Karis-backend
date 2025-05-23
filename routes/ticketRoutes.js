// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

// POST /api/tickets - Create tickets for an event
router.post('/', async (req, res) => {
  try {
    const { eventId, totalTickets } = req.body;

    if (!eventId || !totalTickets) {
      return res.status(400).json({ message: 'eventId and totalTickets are required' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if a ticket already exists for this event
    const existingTicket = await Ticket.findOne({ event: eventId });
    if (existingTicket) {
      return res.status(400).json({ message: 'Ticket already exists for this event' });
    }

    const newTicket = new Ticket({
      event: eventId,
      totalTickets,
      remainingTickets: totalTickets,
    });

    await newTicket.save();
    res.status(201).json(newTicket);
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
