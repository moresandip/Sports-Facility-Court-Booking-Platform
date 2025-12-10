const mongoose = require('mongoose');
const Coach = require('../models/Coach');

// Get all coaches
exports.getCoaches = async (req, res) => {
  try {
    // Mock Mode Check
    if (mongoose.connection.readyState !== 1) {
      return res.json([
        { _id: '1', name: 'Coach Mike', specialties: ['Tennis'], hourlyRate: 30, isActive: true },
        { _id: '2', name: 'Coach Sarah', specialties: ['Basketball'], hourlyRate: 35, isActive: true }
      ]);
    }

    const coaches = await Coach.find({ isActive: true });
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get coach by ID
exports.getCoach = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }
    res.json(coach);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new coach (Admin only)
exports.createCoach = async (req, res) => {
  const coach = new Coach({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    hourlyRate: req.body.hourlyRate,
    specialties: req.body.specialties,
    bio: req.body.bio
  });

  try {
    const newCoach = await coach.save();
    res.status(201).json(newCoach);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update coach (Admin only)
exports.updateCoach = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    if (req.body.name) coach.name = req.body.name;
    if (req.body.email) coach.email = req.body.email;
    if (req.body.phone !== undefined) coach.phone = req.body.phone;
    if (req.body.hourlyRate) coach.hourlyRate = req.body.hourlyRate;
    if (req.body.specialties) coach.specialties = req.body.specialties;
    if (req.body.bio !== undefined) coach.bio = req.body.bio;
    if (req.body.isActive !== undefined) coach.isActive = req.body.isActive;

    const updatedCoach = await coach.save();
    res.json(updatedCoach);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete coach (Admin only)
exports.deleteCoach = async (req, res) => {
  try {
    const coach = await Coach.findById(req.params.id);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    coach.isActive = false;
    await coach.save();
    res.json({ message: 'Coach deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
