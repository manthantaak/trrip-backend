const express = require('express');
const protect = require('../middleware/auth');
const {
  generateItinerary,
  getAllItineraries,
  getItineraryById,
  deleteItinerary,
  getSharedItinerary,
} = require('../controllers/itineraryController');

const router = express.Router();

router.post('/generate', protect, generateItinerary);
router.get('/', protect, getAllItineraries);
router.get('/share/:token', getSharedItinerary);
router.get('/:id', protect, getItineraryById);
router.delete('/:id', protect, deleteItinerary);

module.exports = router;
