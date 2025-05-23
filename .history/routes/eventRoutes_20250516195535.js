// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

\router.post('/', async (req, res) => {
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

module.exports = router;
