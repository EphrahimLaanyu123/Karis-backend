// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// POST /api/events - Create new event (admin only)
router.post('/', async (req, res) => {
  try {
    const { title, description, date, adminId } = req.body;

    if (!title || !date || !adminId) {
      return res.status(400).json({ message: 'Title, date, and adminId are required' });
    }

    const newEvent = new Event({
      title,
      description,
      date,
      createdBy: adminId,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ GET /api/events - Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 }); // Sort by date descending
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
