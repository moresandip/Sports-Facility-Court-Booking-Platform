const PricingRule = require('../models/PricingRule');

const calculatePrice = async (court, startTime, endTime, equipmentList, coach) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end - start) / (1000 * 60 * 60);

    let basePrice = court.basePrice * durationHours;
    let peakHourFee = 0;
    let weekendFee = 0;
    let equipmentFee = 0;
    let coachFee = 0;

    // Fetch active rules
    const rules = await PricingRule.find({ isActive: true });

    // 1. Weekend Rule
    const day = start.getDay(); // 0 = Sunday, 6 = Saturday
    const weekendRule = rules.find(r => r.type === 'weekend');
    if (weekendRule && (day === 0 || day === 6)) {
        if (weekendRule.modifierType === 'multiplier') {
            weekendFee = (basePrice * weekendRule.modifier) - basePrice;
        } else {
            weekendFee = weekendRule.modifier;
        }
    }

    // 2. Peak Hour Rule
    // Simplified: If ANY part of the booking falls in peak hours, apply rule.
    // A more complex version would split the booking into peak/non-peak chunks.
    const startHour = start.getHours();
    const peakRule = rules.find(r => r.type === 'peak_hour');

    if (peakRule) {
        // Check if booking overlaps with peak hours
        // Assuming peakRule has startHour and endHour (e.g., 18 to 21)
        // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
        const ruleStart = peakRule.startHour;
        const ruleEnd = peakRule.endHour;

        // Check for overlap: (StartA < EndB) and (EndA > StartB)
        // using booking hours and rule hours
        const bookingStartHour = start.getHours(); // e.g. 17
        const bookingEndHour = end.getHours();     // e.g. 19

        // Note: ruleStart (e.g. 18) and ruleEnd (e.g. 21)
        // Overlap: 17 < 21 AND 19 > 18 -> True
        if (bookingStartHour < ruleEnd && bookingEndHour > ruleStart) {
            if (peakRule.modifierType === 'multiplier') {
                peakHourFee = (basePrice * peakRule.modifier) - basePrice;
            } else {
                peakHourFee = peakRule.modifier;
            }
        }
    }

    // 3. Indoor Premium (if applicable)
    const indoorRule = rules.find(r => r.type === 'indoor_premium');
    if (indoorRule && court.type === 'indoor') {
        // Apply premium to base price
        if (indoorRule.modifierType === 'multiplier') {
            basePrice = basePrice * indoorRule.modifier;
        } else {
            basePrice += indoorRule.modifier;
        }
    }

    // 4. Equipment Fee
    if (equipmentList && equipmentList.length > 0) {
        for (const item of equipmentList) {
            // item contains { item: EquipmentObj, quantity: Number }
            // We need the actual Equipment document to get the price
            // Assuming the caller passes the populated equipment or we fetch it?
            // For now, let's assume 'item.item' is the populated Equipment document
            if (item.item && item.item.rentalPrice) {
                equipmentFee += item.item.rentalPrice * item.quantity;
            }
        }
    }

    // 5. Coach Fee
    if (coach) {
        coachFee = coach.hourlyRate * durationHours;
    }

    const total = basePrice + peakHourFee + weekendFee + equipmentFee + coachFee;

    return {
        basePrice,
        peakHourFee,
        weekendFee,
        equipmentFee,
        coachFee,
        total
    };
};

module.exports = { calculatePrice };
