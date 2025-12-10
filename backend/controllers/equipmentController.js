const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');

// Get all equipment
exports.getEquipment = async (req, res) => {
  try {
    // Mock Mode Check
    if (mongoose.connection.readyState !== 1) {
      return res.json([
        { _id: '1', name: 'Tennis Racket', type: 'racket', rentalPrice: 5, availableStock: 10, isActive: true },
        { _id: '2', name: 'Basketball', type: 'ball', rentalPrice: 3, availableStock: 15, isActive: true }
      ]);
    }

    const equipment = await Equipment.find({ isActive: true });
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get equipment by ID
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new equipment (Admin only)
exports.createEquipment = async (req, res) => {
  const equipment = new Equipment({
    name: req.body.name,
    type: req.body.type,
    totalStock: req.body.totalStock,
    availableStock: req.body.totalStock, // Initially available stock equals total stock
    rentalPrice: req.body.rentalPrice,
    description: req.body.description
  });

  try {
    const newEquipment = await equipment.save();
    res.status(201).json(newEquipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update equipment (Admin only)
exports.updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    if (req.body.name) equipment.name = req.body.name;
    if (req.body.type) equipment.type = req.body.type;
    if (req.body.totalStock) {
      equipment.totalStock = req.body.totalStock;
      // Adjust available stock if total stock changed
      if (equipment.availableStock > req.body.totalStock) {
        equipment.availableStock = req.body.totalStock;
      }
    }
    if (req.body.availableStock !== undefined) equipment.availableStock = req.body.availableStock;
    if (req.body.rentalPrice) equipment.rentalPrice = req.body.rentalPrice;
    if (req.body.description !== undefined) equipment.description = req.body.description;
    if (req.body.isActive !== undefined) equipment.isActive = req.body.isActive;

    const updatedEquipment = await equipment.save();
    res.json(updatedEquipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete equipment (Admin only)
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    equipment.isActive = false;
    await equipment.save();
    res.json({ message: 'Equipment deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
