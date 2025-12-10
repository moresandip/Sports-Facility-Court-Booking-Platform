const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Coach = require('../models/Coach');
const Equipment = require('../models/Equipment');
const { calculatePrice } = require('../utils/pricingEngine');

let mockBookings = []; // Fallback for when DB is not connected

// Helper to check time overlap
const checkOverlap = async (courtId, startTime, endTime) => {
    const existingBooking = await Booking.findOne({
        court: courtId,
        status: 'confirmed',
        $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } } // Covers wrapping case
        ]
    });
    return !!existingBooking;
};

// Helper to check coach availability
const checkCoachAvailability = async (coachId, startTime, endTime) => {
    if (!coachId) return true;
    const existingBooking = await Booking.findOne({
        coach: coachId,
        status: 'confirmed',
        $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
        ]
    });
    return !existingBooking;
};

exports.createBooking = async (req, res) => {
    try {
        const { user, courtId, startTime, endTime, equipment = [], coachId } = req.body;

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
            return res.status(400).json({ message: 'Start time must be before end time' });
        }

        // Mock Mode Check
        if (mongoose.connection.readyState !== 1) {
            const mockPrice = {
                basePrice: 50,
                peakHourFee: 0,
                weekendFee: 0,
                equipmentFee: 0,
                coachFee: 0,
                total: 50
            };

            const newBooking = {
                _id: Date.now().toString(),
                user: user || 'guest',
                court: { _id: courtId, name: 'Mock Court', type: 'indoor' }, // Mock populated court
                startTime: start,
                endTime: end,
                equipment,
                coach: coachId,
                status: 'confirmed',
                pricingBreakdown: mockPrice,
                createdAt: new Date()
            };
            mockBookings.push(newBooking);
            console.log('Booking created in MOCK mode');
            return res.status(201).json(newBooking);
        }

        // 1. Check Court Availability
        const court = await Court.findById(courtId);
        if (!court) {
            return res.status(404).json({ message: 'Court not found' });
        }

        const isCourtTaken = await checkOverlap(courtId, start, end);
        if (isCourtTaken) {
            return res.status(400).json({ message: 'Court is already booked for this time slot' });
        }

        // 2. Check Coach Availability
        let coach = null;
        if (coachId) {
            coach = await Coach.findById(coachId);
            if (!coach) {
                return res.status(404).json({ message: 'Coach not found' });
            }
            const isCoachFree = await checkCoachAvailability(coachId, start, end);
            if (!isCoachFree) {
                return res.status(400).json({ message: 'Coach is not available for this time slot' });
            }
        }

        // 3. Check Equipment Availability
        // This is trickier because we need to sum up quantity used in overlapping bookings
        // For simplicity in this MVP, we'll just check if the requested quantity <= total stock
        // A robust solution would aggregate all active bookings in this slot and subtract from stock.
        const equipmentList = [];
        for (const item of equipment) {
            const eq = await Equipment.findById(item.item);
            if (!eq) {
                return res.status(404).json({ message: `Equipment ${item.item} not found` });
            }
            if (eq.availableStock < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for ${eq.name}` });
            }
            equipmentList.push({ item: eq, quantity: item.quantity });
        }

        // 4. Calculate Price
        const pricingBreakdown = await calculatePrice(court, start, end, equipmentList, coach);

        // 5. Create Booking
        const booking = new Booking({
            user,
            court: courtId,
            startTime: start,
            endTime: end,
            equipment,
            coach: coachId,
            pricingBreakdown
        });

        await booking.save();

        res.status(201).json(booking);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.calculateBookingPrice = async (req, res) => {
    try {
        const { courtId, startTime, endTime, equipment = [], coachId } = req.body;

        const start = new Date(startTime);
        const end = new Date(endTime);

        // Mock Mode Check
        if (mongoose.connection.readyState !== 1) {
            return res.json({
                basePrice: 50,
                peakHourFee: 0,
                weekendFee: 0,
                equipmentFee: 0,
                coachFee: 0,
                total: 50
            });
        }

        const court = await Court.findById(courtId);
        if (!court) return res.status(404).json({ message: 'Court not found' });

        let coach = null;
        if (coachId) {
            coach = await Coach.findById(coachId);
        }

        const equipmentList = [];
        for (const item of equipment) {
            const eq = await Equipment.findById(item.item);
            if (eq) equipmentList.push({ item: eq, quantity: item.quantity });
        }

        const pricing = await calculatePrice(court, start, end, equipmentList, coach);
        res.json(pricing);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getBookings = async (req, res) => {
    try {
        const { user, date } = req.query;

        // Mock Mode Check
        if (mongoose.connection.readyState !== 1) {
            let filtered = [...mockBookings];
            if (date) {
                const searchDate = new Date(date).toDateString();
                filtered = filtered.filter(b => new Date(b.startTime).toDateString() === searchDate);
            }
            return res.json(filtered);
        }

        let query = {};

        if (user) {
            query.user = user;
        }

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            query.startTime = {
                $gte: startOfDay,
                $lte: endOfDay
            };
        }

        const bookings = await Booking.find(query)
            .populate('court')
            .populate('coach')
            .populate('equipment.item')
            .sort({ startTime: 1 });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        // Mock Mode Check
        if (mongoose.connection.readyState !== 1) {
            const index = mockBookings.findIndex(b => b._id === id);
            if (index === -1) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            mockBookings.splice(index, 1);
            return res.json({ message: 'Booking cancelled successfully (Mock)' });
        }

        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
