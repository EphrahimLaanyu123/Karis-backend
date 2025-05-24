const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  tickets: { type: Number, required: true },
  ticketPrice: { type: Number, required: true },
  image: { type: String, default: '' }, // image URL
  category: {
    type: String,
    enum: ['Music', 'Education', 'Sports', 'Technology', 'Art', 'Health', 'Business', 'Other'],
    default: 'Other'
  },
  location: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
