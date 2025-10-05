const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createMeal, getMealsByCookId } = require('../controllers/mealController');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), createMeal);
router.get('/:cookId', getMealsByCookId);

module.exports = router;