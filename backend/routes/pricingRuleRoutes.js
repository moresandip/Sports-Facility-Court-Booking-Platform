const express = require('express');
const router = express.Router();
const pricingRuleController = require('../controllers/pricingRuleController');

router.get('/', pricingRuleController.getPricingRules);
router.get('/:id', pricingRuleController.getPricingRule);
router.post('/', pricingRuleController.createPricingRule);
router.put('/:id', pricingRuleController.updatePricingRule);
router.delete('/:id', pricingRuleController.deletePricingRule);

module.exports = router;
