const express = require('express');
const router = express.Router();
const Attendee = require('../models/Attendee');
const Event = require('../models/Event');
const User = require('../models/User');

// POST /api/attendees/book
router.post('/book', async (req, res) => {
  try {
    const { userId, eventId, numberOfTickets } = req.body;

    // Basic validation
    if (!userId || !eventId || !numberOfTickets || numberOfTickets <= 0) {
      return res.status(400).json({
        message: 'userId, eventId, and a valid numberOfTickets are required.',
      });
    }

    // Find user and event
    const user = await User.findById(userId);
    const event = await Event.findById(eventId);

    if (!user || !event) {
      return res.status(404).json({ message: 'User or Event not found.' });
    }

    // Check ticket availability
    if (event.tickets < numberOfTickets) {
      return res.status(400).json({
        message: `Only ${event.tickets} ticket(s) available.`,
      });
    }

    // Prevent duplicate booking
    const existing = await Attendee.findOne({ user: userId, event: eventId });
    if (existing) {
      return res.status(400).json({
        message: 'User has already booked tickets for this event.',
      });
    }

    // Calculate total price
    const totalPrice = numberOfTickets * event.ticketPrice;

    // Create new attendee
    const attendee = new Attendee({
      user: userId,
      event: eventId,
      numberOfTickets,
    });

    await attendee.save();

    // Update event's remaining tickets
    event.tickets -= numberOfTickets;
    await event.save();

    // Respond with booking details
    res.status(201).json({
      message: 'Booking successful',
      attendeeId: attendee._id,
      numberOfTickets,
      totalPrice,
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /api/attendees/:eventId
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const attendees = await Attendee.find({ event: eventId })
      .populate('user', 'name email') // include name if available
      .select('user numberOfTickets createdAt');

    res.status(200).json(attendees);
  } catch (error) {
    console.error('Fetch attendees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendees/analytics/:userId
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Step 1: Find all events created by this user
    const events = await Event.find({ user: userId });

    if (!events.length) {
      return res.status(404).json({ message: 'No events found for this user.' });
    }

    const eventIds = events.map(event => event._id.toString());

    // Step 2: Get all attendees for these events
    const attendees = await Attendee.find({ event: { $in: eventIds } });

    // Step 3: Calculate total tickets sold and total revenue
    let totalTicketsSold = 0;
    let totalRevenue = 0;

    attendees.forEach(att => {
      const event = events.find(e => e._id.toString() === att.event.toString());
      const ticketPrice = event ? event.ticketPrice : 0;
      totalTicketsSold += att.numberOfTickets;
      totalRevenue += att.numberOfTickets * ticketPrice;
    });

    // Step 4: Send analytics
    res.status(200).json({
      totalEvents: events.length,
      totalTickets: events.reduce((sum, e) => sum + e.tickets + attendees
        .filter(a => a.event.toString() === e._id.toString())
        .reduce((s, a) => s + a.numberOfTickets, 0), 0), // sold + available
      ticketsSold: totalTicketsSold,
      totalRevenue,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
