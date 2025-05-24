const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// POST /api/events - Create new event (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      adminId,
      tickets,
      ticketPrice,
      category,
      image,     // Expecting a URL string
      location
    } = req.body;

    if (!title || !date || !adminId || tickets == null || ticketPrice == null || !location) {
      return res.status(400).json({ message: 'Title, date, adminId, tickets, ticketPrice, and location are required.' });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      createdBy: adminId,
      tickets,
      ticketPrice,
      category: category || 'Other',
      image: image || '',
      location
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
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// GET /api/events/:eventId - Get single event by ID
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/events/admin/:adminId - Get events by specific admin
router.get('/admin/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;
    const events = await Event.find({ createdBy: adminId }).sort({ date: -1 });
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching admin events:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/events/book/:eventId - Book a ticket for an event
router.post('/book/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.tickets <= 0) {
      return res.status(400).json({ message: 'No tickets available' });
    }

    event.tickets -= 1;
    await event.save();

    res.status(200).json({
      message: 'Ticket booked successfully',
      event,
      ticketPrice: event.ticketPrice
    });
  } catch (err) {
    console.error('Error booking ticket:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/events/:eventId - Update event tickets (admin only)
router.put('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { ticketsToAdd } = req.body;

    if (!ticketsToAdd || ticketsToAdd <= 0) {
      return res.status(400).json({ message: 'ticketsToAdd must be a positive number' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.tickets += ticketsToAdd;
    await event.save();

    res.status(200).json(event);
  } catch (err) {
    console.error('Error updating event tickets:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/events/:eventId/edit - Edit event details (admin only)
router.put('/:eventId/edit', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, date, ticketPrice } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (ticketPrice != null) event.ticketPrice = ticketPrice;

    await event.save();
    res.status(200).json({ message: 'Event updated successfully', event });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/events/:eventId - Delete event (admin only)
router.delete('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
