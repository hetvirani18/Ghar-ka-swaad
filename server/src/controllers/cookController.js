const Cook = require('../models/Cook');
const asyncHandler = require('express-async-handler');
const cloudinary = require('../config/cloudinary');

// @desc    Register a new cook
// @route   POST /api/cooks/register
// @access  Public
exports.registerCook = asyncHandler(async (req, res) => {
  const { name, bio, pincode, neighborhood, upiId } = req.body;
  
  // For MVP, using hardcoded coordinates based on pincode
  // In a real app, we would use a geocoding service
  const coordinates = simulateGeocode(pincode);
  
  // Handle image uploads
  if (!req.files || req.files.length < 3) {
    res.status(400);
    throw new Error('Please upload at least 3 kitchen images');
  }
  
  // Upload images to Cloudinary
  const uploadPromises = req.files.map(file => 
    cloudinary.uploader.upload(file.path, {
      folder: 'homebite/kitchens',
    })
  );
  
  const uploadResults = await Promise.all(uploadPromises);
  const kitchenImageUrls = uploadResults.map(result => result.secure_url);
  
  // Create cook profile
  const cook = await Cook.create({
    name,
    bio,
    location: {
      type: 'Point',
      coordinates,
      pincode,
      neighborhood
    },
    kitchenImageUrls,
    upiId,
  });
  
  if (cook) {
    res.status(201).json(cook);
  } else {
    res.status(400);
    throw new Error('Invalid cook data');
  }
});

// @desc    Update cook profile
// @route   PUT /api/cooks/:id
// @access  Public (should be Private in real app)
exports.updateCook = asyncHandler(async (req, res) => {
  const cook = await Cook.findById(req.params.id);
  
  if (!cook) {
    res.status(404);
    throw new Error('Cook not found');
  }
  
  // Update cook profile
  const updatedCook = await Cook.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true }
  );
  
  res.json(updatedCook);
});

// @desc    Get all cooks by location
// @route   GET /api/cooks
// @access  Public
exports.getCooks = asyncHandler(async (req, res) => {
  try {
    const { pincode, lat, lon } = req.query;
    
    let query = {};
    
    // If coordinates are provided, find cooks nearby
    if (lat && lon) {
      query = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lon), parseFloat(lat)]
            },
            $maxDistance: 5000 // 5km radius
          }
        }
      };
    } 
    // If pincode is provided, search by pincode
    else if (pincode) {
      query = { 'location.pincode': pincode };
    }
    
    // Add error handling for database connection issues
    const cooks = await Cook.find(query);
    
    console.log(`Found ${cooks.length} cooks matching query:`, JSON.stringify(query));
    res.json(cooks);
  } catch (error) {
    console.error('Error in getCooks controller:', error);
    res.status(500).json({ 
      message: 'Failed to fetch cooks', 
      error: error.message
    });
  }
});

// @desc    Get cook by ID
// @route   GET /api/cooks/:id
// @access  Public
exports.getCookById = asyncHandler(async (req, res) => {
  try {
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid cook ID format' });
    }
    
    const cook = await Cook.findById(req.params.id);
    
    if (cook) {
      res.json(cook);
    } else {
      res.status(404).json({ message: 'Cook not found' });
    }
  } catch (error) {
    console.error('Error in getCookById controller:', error);
    res.status(500).json({ 
      message: 'Failed to fetch cook details', 
      error: error.message 
    });
  }
});

// @desc    Get nearby cooks based on lat/lng
// @route   GET /api/cooks/nearby
// @access  Public
exports.getNearby = asyncHandler(async (req, res) => {
  const { lat, lng, maxDistance = 5 } = req.query;
  
  if (!lat || !lng) {
    res.status(400);
    throw new Error('Latitude and longitude are required');
  }

  const cooks = await Cook.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    }
  });

  // Calculate distance for each cook
  const cooksWithDistance = cooks.map(cook => {
    const cookObj = cook.toObject();
    cookObj.distance = calculateDistance(
      parseFloat(lat),
      parseFloat(lng),
      cook.location.coordinates[1],
      cook.location.coordinates[0]
    );
    return cookObj;
  });

  res.json(cooksWithDistance);
});

// @desc    Get cooks by pincode
// @route   GET /api/cooks/pincode/:pincode
// @access  Public
exports.getByPincode = asyncHandler(async (req, res) => {
  const { pincode } = req.params;
  
  if (!pincode) {
    res.status(400);
    throw new Error('Pincode is required');
  }

  const cooks = await Cook.find({ 'location.pincode': pincode });
  res.json(cooks);
});

// Helper function to calculate distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c;
  return distance;
}

// Helper function to simulate geocoding
function simulateGeocode(pincode) {
  // This is a simple simulation - in a real app we'd use a geocoding service
  // For now we'll return random coordinates in India
  const pincodeMap = {
    '400001': [72.8311, 18.9220], // Mumbai
    '110001': [77.2090, 28.6139], // Delhi
    '600001': [80.2707, 13.0827], // Chennai
    '700001': [88.3639, 22.5726], // Kolkata
    '560001': [77.5946, 12.9716], // Bangalore,
    '382350': [72.6369, 23.2156]  // Ahmedabad/Gandhinagar area
  };
  
  return pincodeMap[pincode] || [
    72 + Math.random() * 6, // longitude between ~72-78
    18 + Math.random() * 12  // latitude between ~18-30
  ];
}