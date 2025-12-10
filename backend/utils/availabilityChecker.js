const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');

async function checkAvailability(courtId, coachId, equipmentRequests, startTime, endTime) {
  const errors = [];

  // Check court availability
  const courtConflict = await Booking.findOne({
    court: courtId,
    status: 'confirmed',
    $or: [
      // New booking starts during existing booking
      { startTime: { $lt: endTime, $gte: startTime } },
      // New booking ends during existing booking
      { endTime: { $gt: startTime, $lte: endTime } },
      // New booking completely encompasses existing booking
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
    ]
  });

  if (courtConflict) {
    errors.push('Court is not available for the selected time slot');
  }

  // Check coach availability (if coach is requested)
  if (coachId) {
    const coachConflict = await Booking.findOne({
      'resources.coach': coachId,
      status: 'confirmed',
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
      ]
    });

    if (coachConflict) {
      errors.push('Coach is not available for the selected time slot');
    }
  }

  // Check equipment availability
  if (equipmentRequests.rackets > 0) {
    const racketEquipment = await Equipment.findOne({
      type: 'racket',
      isActive: true
    });

    if (!racketEquipment) {
      errors.push('Rackets are not available');
    } else {
      // Count currently booked rackets for this time slot
      const bookedRackets = await Booking.aggregate([
        {
          $match: {
            status: 'confirmed',
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        },
        {
          $group: {
            _id: null,
            totalBooked: { $sum: '$resources.rackets' }
          }
        }
      ]);

      const currentlyBooked = bookedRackets.length > 0 ? bookedRackets[0].totalBooked : 0;
      const availableRackets = racketEquipment.availableStock - currentlyBooked;

      if (availableRackets < equipmentRequests.rackets) {
        errors.push(`Only ${availableRackets} rackets available for the selected time slot`);
      }
    }
  }

  if (equipmentRequests.shoes > 0) {
    const shoeEquipment = await Equipment.findOne({
      type: 'shoes',
      isActive: true
    });

    if (!shoeEquipment) {
      errors.push('Shoes are not available');
    } else {
      // Count currently booked shoes for this time slot
      const bookedShoes = await Booking.aggregate([
        {
          $match: {
            status: 'confirmed',
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
          }
        },
        {
          $group: {
            _id: null,
            totalBooked: { $sum: '$resources.shoes' }
          }
        }
      ]);

      const currentlyBooked = bookedShoes.length > 0 ? bookedShoes[0].totalBooked : 0;
      const availableShoes = shoeEquipment.availableStock - currentlyBooked;

      if (availableShoes < equipmentRequests.shoes) {
        errors.push(`Only ${availableShoes} shoes available for the selected time slot`);
      }
    }
  }

  return {
    available: errors.length === 0,
    errors
  };
}

module.exports = {
  checkAvailability
};
