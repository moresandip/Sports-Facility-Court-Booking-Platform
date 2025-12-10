const Court = require('../models/Court');
const mongoose = require('mongoose');

// Mock data for when MongoDB is not available
let mockCourts = [
    { _id: '1', name: 'Basketball Court A', type: 'indoor', basePrice: 50, isActive: true },
    { _id: '2', name: 'Tennis Court B', type: 'outdoor', basePrice: 40, isActive: true }
];

exports.getCourts = async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (mongoose.connection.readyState === 1) {
            const courts = await Court.find();
            res.json(courts);
        } else {
            // Return mock data if MongoDB is not connected
            console.log('Using mock court data (MongoDB not connected)');
            res.json(mockCourts);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createCourt = async (req, res) => {
    console.log('API: createCourt called.');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    try {
        const { name, type, basePrice } = req.body;

        if (!name || !basePrice) {
            console.error('API Error: Missing required fields');
            return res.status(400).json({ message: 'Name and Base Price are required' });
        }

        // Check if MongoDB is connected
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB is connected. Saving to DB...');
            const court = new Court({ name, type, basePrice });
            await court.save();
            console.log('Court created successfully in database:', court);
            return res.status(201).json(court);
        } else {
            console.warn('MongoDB NOT connected. Using mock data.');
            // Use mock data if MongoDB is not connected
            const newCourt = {
                _id: Date.now().toString(),
                name,
                type: type || 'indoor',
                basePrice: Number(basePrice),
                isActive: true,
                createdAt: new Date()
            };
            mockCourts.push(newCourt);
            console.log('Court created successfully in mock data:', newCourt);
            return res.status(201).json(newCourt);
        }
    } catch (error) {
        console.error('Error in createCourt:', error);
        return res.status(500).json({ message: 'Internal server error processing court creation', error: error.message });
    }
};
