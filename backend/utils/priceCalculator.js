const PricingRule = require('../models/PricingRule');

async function calculateTotal(court, startTime, resources, durationHours) {
  let basePrice = court.basePrice * durationHours;

  // Get active pricing rules
  const rules = await PricingRule.find({ isActive: true });

  let peakHourFee = 0;
  let weekendFee = 0;
  let indoorFee = 0;

  const bookingHour = startTime.getHours();
  const bookingDay = startTime.getDay(); // 0 = Sunday, 6 = Saturday

  // Apply rules
  for (const rule of rules) {
    switch (rule.type) {
      case 'peak_hour':
        if (bookingHour >= rule.startHour && bookingHour < rule.endHour) {
          if (rule.modifierType === 'multiplier') {
            peakHourFee += basePrice * (rule.modifier - 1);
          } else if (rule.modifierType === 'fixed') {
            peakHourFee += rule.modifier * durationHours;
          }
        }
        break;

      case 'weekend':
        if (bookingDay === 0 || bookingDay === 6) { // Sunday or Saturday
          if (rule.modifierType === 'multiplier') {
            weekendFee += basePrice * (rule.modifier - 1);
          } else if (rule.modifierType === 'fixed') {
            weekendFee += rule.modifier * durationHours;
          }
        }
        break;

      case 'indoor_premium':
        if (court.type === 'indoor') {
          if (rule.modifierType === 'multiplier') {
            indoorFee += basePrice * (rule.modifier - 1);
          } else if (rule.modifierType === 'fixed') {
            indoorFee += rule.modifier * durationHours;
          }
        }
        break;
    }
  }

  // Calculate equipment fees
  let equipmentFee = 0;
  if (resources.rackets > 0) {
    const racketRule = rules.find(r => r.type === 'equipment' && r.name.toLowerCase().includes('racket'));
    if (racketRule) {
      equipmentFee += racketRule.modifier * resources.rackets * durationHours;
    }
  }
  if (resources.shoes > 0) {
    const shoeRule = rules.find(r => r.type === 'equipment' && r.name.toLowerCase().includes('shoe'));
    if (shoeRule) {
      equipmentFee += shoeRule.modifier * resources.shoes * durationHours;
    }
  }

  // Calculate coach fee
  let coachFee = 0;
  if (resources.coach) {
    // Coach fee is per hour, so multiply by duration
    coachFee = resources.coach.hourlyRate * durationHours;
  }

  const total = basePrice + peakHourFee + weekendFee + indoorFee + equipmentFee + coachFee;

  return {
    basePrice,
    peakHourFee,
    weekendFee,
    indoorFee,
    equipmentFee,
    coachFee,
    total
  };
}

module.exports = {
  calculateTotal
};
