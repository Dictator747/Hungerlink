const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodNeeded: { type: String, required: true },
  quantity: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    coordinates: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },
  distance: { type: String },
  requesterName: { type: String },
  requesterType: { type: String, enum: ['ngo', 'individual'], required: true },
  status: { type: String, enum: ['open', 'accepted', 'fulfilled'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);
