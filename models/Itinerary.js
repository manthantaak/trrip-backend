const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    activity: { type: String, required: true },
    location: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const daySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    date: { type: String, default: '' },
    activities: [activitySchema],
  },
  { _id: false }
);

const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    summary: { type: String, required: true },
    days: [daySchema],
    tips: [{ type: String }],
    sourceDocuments: [
      {
        documentType: { type: String, required: true },
        originalName: { type: String, required: true },
      },
    ],
    shareToken: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Itinerary', itinerarySchema);
