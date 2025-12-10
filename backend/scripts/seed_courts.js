const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Court = require('../models/Court');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-booking')
    .then(() => {
        console.log("Connected to MongoDB");
        seedCourts();
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    });

const courts = [
    { name: 'Center Court', type: 'indoor', basePrice: 50, description: 'Premium indoor court with AC' },
    { name: 'Court 1', type: 'outdoor', basePrice: 30, description: 'Standard outdoor court' },
    { name: 'Court 2', type: 'outdoor', basePrice: 30, description: 'Standard outdoor court' },
    { name: 'Training Court', type: 'indoor', basePrice: 40, description: 'Smaller indoor court for practice' }
];

const seedCourts = async () => {
    try {
        await Court.deleteMany({});
        await Court.insertMany(courts);
        console.log("Courts seeded successfully");
        process.exit();
    } catch (error) {
        console.error("Error seeding courts:", error);
        process.exit(1);
    }
};
