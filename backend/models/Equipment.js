const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['racket', 'shoes', 'other'],
    required: true
  },
  totalStock: {
    type: Number,
    required: true,
    min: 0
  },
  availableStock: {
    type: Number,
    required: true,
    min: 0
  },
  rentalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Equipment', EquipmentSchema);
