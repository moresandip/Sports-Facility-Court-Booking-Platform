const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');

// GET /api/coaches - Get all coaches
router.get('/', coachController.getCoaches);

// GET /api/coaches/:id - Get coach by ID
router.get('/:id', coachController.getCoach);

// POST /api/coaches - Create new coach (Admin only)
router.post('/', coachController.createCoach);

// PUT /api/coaches/:id - Update coach (Admin only)
router.put('/:id', coachController.updateCoach);

// DELETE /api/coaches/:id - Delete coach (Admin only)
router.delete('/:id', coachController.deleteCoach);

module.exports = router;
