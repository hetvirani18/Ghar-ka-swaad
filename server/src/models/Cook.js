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
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    neighborhood: {
      type: String,
      required: true
    }
  },
  kitchenImageUrls: {
    type: [String],
    required: true,
    validate: [
      {
        validator: function(array) {
          return array.length >= 3;
        },
        message: 'At least 3 kitchen images are required'
      }
    ]
  },
  upiId: {
    type: String,
    required: true
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