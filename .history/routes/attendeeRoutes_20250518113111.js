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

// GET /api/attendees/admin/:adminId
router.get('/admin/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;

    // Find all events created by this admin
    const events = await Event.find({ adminId }).select('_id ticketPrice');
    const eventIds = events.map(e => e._id.toString());
    const ticketPriceMap = Object.fromEntries(events.map(e => [e._id.toString(), e.ticketPrice]));

    if (eventIds.length === 0) {
      return res.status(200).json({ attendees: [], totalTicketsSold: 0, totalRevenue: 0 });
    }

    // Fetch all attendees for those events
    const attendees = await Attendee.find({ event: { $in: eventIds } })
      .populate('user', 'name email')
      .select('user event numberOfTickets createdAt');

    let totalTicketsSold = 0;
    let totalRevenue = 0;

    for (const attendee of attendees) {
      const ticketPrice = ticketPriceMap[attendee.event.toString()] || 0;
      totalTicketsSold += attendee.numberOfTickets;
      totalRevenue += attendee.numberOfTickets * ticketPrice;
    }

    res.status(200).json({
      attendees,
      totalTicketsSold,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching admin attendees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
