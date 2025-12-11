const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

const CourtSchema = new mongoose.Schema({
    name: String,
    type: String,
    basePrice: Number
});
const Court = mongoose.model('Court', CourtSchema);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sports_booking';

async function checkData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const courtCount = await Court.countDocuments();
        console.log(`Courts found: ${courtCount}`);

        if (courtCount === 0) {
            console.log('Seeding courts...');
            await Court.create([
                { name: 'Center Court', type: 'Indoor', basePrice: 50 },
                { name: 'Court 1', type: 'Outdoor', basePrice: 35 },
                { name: 'Court 2', type: 'Outdoor', basePrice: 35 }
            ]);
            console.log('Courts seeded.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
