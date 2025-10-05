const mongoose = require('mongoose');

const cookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false,
      default: [0, 0]
    },
    pincode: {
      type: String,
      required: false,
      default: '000000'
    },
    neighborhood: {
      type: String,
      required: false,
      default: 'Unknown'
    }
  },
  kitchenImageUrls: {
    type: [String],
    required: false,
    default: [],
    validate: [
      {
        validator: function(array) {
          // Only validate if array has items
          if (array.length === 0) return true;
          return array.length >= 3;
        },
        message: 'If providing kitchen images, at least 3 are required'
      }
    ]
  },
  upiId: {
    type: String,
    required: false,
    default: ''
  },
  averageRating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create a 2dsphere index on the location field for geospatial queries
cookSchema.index({ "location": "2dsphere" });

module.exports = mongoose.model('Cook', cookSchema);