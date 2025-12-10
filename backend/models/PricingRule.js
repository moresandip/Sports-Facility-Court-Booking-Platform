const mongoose = require('mongoose');

const PricingRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['peak_hour', 'weekend', 'indoor_premium', 'equipment', 'holiday'],
    required: true
  },
  modifier: {
    type: Number,
    required: true,
    min: 0
  },
  modifierType: {
    type: String,
    enum: ['multiplier', 'fixed'],
    required: true
  },
  startHour: {
    type: Number,
    min: 0,
    max: 23,
    default: null
  },
  endHour: {
    type: Number,
    min: 0,
    max: 23,
    default: null
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

module.exports = mongoose.model('PricingRule', PricingRuleSchema);
