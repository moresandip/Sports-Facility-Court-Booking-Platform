const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// POST /api/bookings - Create new booking
router.post('/', bookingController.createBooking);

// POST /api/bookings/quote - Calculate price request
router.post('/quote', bookingController.calculateBookingPrice);

// GET /api/bookings - Get all bookings (with optional filters)
router.get('/', bookingController.getBookings);

module.exports = router;
