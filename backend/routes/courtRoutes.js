const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');

// GET /api/courts - Get all courts
router.get('/', courtController.getCourts);

// POST /api/courts - optional, for admin
router.post('/', courtController.createCourt);

module.exports = router;
