const PricingRule = require('../models/PricingRule');

// Get all pricing rules
exports.getPricingRules = async (req, res) => {
  try {
    const rules = await PricingRule.find();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pricing rule by ID
exports.getPricingRule = async (req, res) => {
  try {
    const rule = await PricingRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }
    res.json(rule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new pricing rule (Admin only)
exports.createPricingRule = async (req, res) => {
  const rule = new PricingRule({
    name: req.body.name,
    type: req.body.type,
    modifier: req.body.modifier,
    modifierType: req.body.modifierType,
    startHour: req.body.startHour,
    endHour: req.body.endHour,
    description: req.body.description
  });

  try {
    const newRule = await rule.save();
    res.status(201).json(newRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update pricing rule (Admin only)
exports.updatePricingRule = async (req, res) => {
  try {
    const rule = await PricingRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }

    if (req.body.name) rule.name = req.body.name;
    if (req.body.type) rule.type = req.body.type;
    if (req.body.modifier) rule.modifier = req.body.modifier;
    if (req.body.modifierType) rule.modifierType = req.body.modifierType;
    if (req.body.startHour !== undefined) rule.startHour = req.body.startHour;
    if (req.body.endHour !== undefined) rule.endHour = req.body.endHour;
    if (req.body.description !== undefined) rule.description = req.body.description;
    if (req.body.isActive !== undefined) rule.isActive = req.body.isActive;

    const updatedRule = await rule.save();
    res.json(updatedRule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete pricing rule (Admin only)
exports.deletePricingRule = async (req, res) => {
  try {
    const rule = await PricingRule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }

    rule.isActive = false;
    await rule.save();
    res.json({ message: 'Pricing rule deactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
