const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: String, // Keeping it simple for now, can be ObjectId ref to User later
        required: true
    },
    court: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Court',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    equipment: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Equipment'
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    coach: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        default: null
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'waitlist'],
        default: 'confirmed'
    },
    pricingBreakdown: {
        basePrice: Number,
        peakHourFee: Number,
        weekendFee: Number,
        equipmentFee: Number,
        coachFee: Number,
        total: Number
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
