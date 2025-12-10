const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const PricingRule = require('../models/PricingRule');
const { calculatePrice } = require('../utils/pricingEngine');

// Mock connection for standalone test
mongoose.connect('mongodb://localhost:27017/sports-booking', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to DB');
    runTests();
}).catch(err => {
    console.error(err);
    process.exit(1);
});

async function runTests() {
    try {
        // Cleanup
        await Booking.deleteMany({});
        await Court.deleteMany({});
        await PricingRule.deleteMany({});

        // 1. Setup Court
        const court = await Court.create({
            name: 'Test Court 1',
            type: 'outdoor',
            basePrice: 100
        });

        // 2. Setup Pricing Rules
        // Peak Hour: 18:00 - 21:00, 1.5x multiplier
        await PricingRule.create({
            name: 'Evening Peak',
            type: 'peak_hour',
            modifier: 1.5,
            modifierType: 'multiplier',
            startHour: 18,
            endHour: 21
        });

        // Weekend: 1.2x multiplier
        await PricingRule.create({
            name: 'Weekend Surcharge',
            type: 'weekend',
            modifier: 1.2,
            modifierType: 'multiplier'
        });

        console.log('--- Test 1: Simple Booking (No Rules) ---');
        // Monday 10:00 - 12:00 (2 hours)
        // Base: 100 * 2 = 200
        const start1 = new Date('2025-12-15T10:00:00'); // Monday
        const end1 = new Date('2025-12-15T12:00:00');
        const price1 = await calculatePrice(court, start1, end1, [], null);
        console.log(`Expected: 200. Actual: ${price1.total}`);
        if (price1.total !== 200) console.error('FAIL Test 1');

        console.log('--- Test 2: Peak Hour Booking ---');
        // Monday 18:00 - 20:00 (2 hours)
        // Base: 200. Peak: (200 * 1.5) - 200 = 100. Total = 300.
        const start2 = new Date('2025-12-15T18:00:00');
        const end2 = new Date('2025-12-15T20:00:00');
        const price2 = await calculatePrice(court, start2, end2, [], null);
        console.log(`Expected: 300. Actual: ${price2.total}`);
        if (price2.total !== 300) console.error('FAIL Test 2');


        console.log('--- Test 3: Partial Peak Overlap (Start before, End inside) ---');
        // Monday 17:00 - 19:00 (2 hours)
        // Current Logic checks startHour (17). 17 < 18, so NO PEAK.
        // Expected Logic: 1 hour normal (100) + 1 hour peak (150) = 250?
        // OR Simplified Logic: If any overlap, apply to WHOLE booking?
        // PricingEngine.js says: "Simplified: If ANY part... apply rule."
        // But logic is: if (startHour >= 18 && startHour < 21)
        // So 17 >= 18 is FALSE.
        // This confirms the bug I suspected.
        const start3 = new Date('2025-12-15T17:00:00');
        const end3 = new Date('2025-12-15T19:00:00');
        const price3 = await calculatePrice(court, start3, end3, [], null);
        console.log(`Duration: 2h. Base: 200.`);
        console.log(`With Peak applied to whole: 300.`);
        console.log(`With Split (1h normal, 1h peak): 250.`);
        console.log(`Actual Result: ${price3.total}`);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}
