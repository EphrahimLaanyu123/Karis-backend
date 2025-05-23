const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// POST /api/events - Create new event (admin only)
router.post('/', async (req, res) => {
  try {
    const { title, description, date, adminId, totalTickets } = req.body;

    if (!title || !date || !adminId || totalTickets == null) {
      return res.status(400).json({ message: 'Title, date, adminId, and totalTickets are required' });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      createdBy: adminId,
      totalTickets,
      remainingTickets: totalTickets,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET all events
router.get('/', async (req, res) => {
    try {
      const events = await Event.find();
      const enhancedEvents = events.map(event => ({
        ...event.toObject(),
        remainingTickets: event.totalTickets - event.bookedTickets,
      }));
      res.json(enhancedEvents);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });
  

// GET /api/events/:eventId - Get single event by ID (including ticket counts)
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event); // Includes totalTickets & remainingTickets
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/events/admin/:adminId - Get events by specific admin (including ticket counts)
router.get('/admin/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;
    const events = await Event.find({ createdBy: adminId }).sort({ date: -1 });
    res.status(200).json(events); // Each event includes totalTickets & remainingTickets
  } catch (err) {
    console.error('Error fetching admin events:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/events/book/:eventId - Book a ticket for an event
router.post('/book/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body; // Optional: validate userId if needed

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.remainingTickets <= 0) {
      return res.status(400).json({ message: 'No tickets available' });
    }

    event.remainingTickets -= 1;

    await event.save();

    res.status(200).json({ message: 'Ticket booked successfully', event });
  } catch (err) {
    console.error('Error booking ticket:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/events/:eventId - Update event tickets (admin only)
router.put('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { totalTicketsToAdd } = req.body;

    if (!totalTicketsToAdd || totalTicketsToAdd <= 0) {
      return res.status(400).json({ message: 'totalTicketsToAdd must be a positive number' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.totalTickets += totalTicketsToAdd;
    event.remainingTickets += totalTicketsToAdd;

    await event.save();

    res.status(200).json(event);
  } catch (err) {
    console.error('Error updating event tickets:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
