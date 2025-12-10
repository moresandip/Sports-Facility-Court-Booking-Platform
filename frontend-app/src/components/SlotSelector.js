import React from 'react';

const SlotSelector = ({ selectedDate, selectedSlot, onSelectSlot, bookings = [] }) => {
    // Generate slots from 6 AM to 10 PM
    const slots = [];
    for (let i = 6; i < 22; i++) {
        slots.push(i);
    }

    const isSlotBooked = (hour) => {
        // Check if any booking overlaps with this hour
        // Booking has startTime and endTime
        // Slot is from hour:00 to hour+1:00
        const slotStart = new Date(selectedDate);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(selectedDate);
        slotEnd.setHours(hour + 1, 0, 0, 0);

        return bookings.some(booking => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);

            // Check overlap
            return (bookingStart < slotEnd && bookingEnd > slotStart);
        });
    };

    return (
        <div className="slot-selector">
            <div className="slot-info">
                <h3>⏰ Available Time Slots</h3>
                <p className="slot-description">
                    Choose your preferred time slot for {selectedDate.toLocaleDateString()}
                </p>
            </div>
            <div className="slots-grid">
                {slots.map(hour => {
                    const booked = isSlotBooked(hour);
                    const isSelected = selectedSlot && selectedSlot.getHours() === hour;
                    const currentHour = new Date().getHours();
                    const isPast = hour <= currentHour && selectedDate.toDateString() === new Date().toDateString();

                    return (
                        <button
                            key={hour}
                            disabled={booked || isPast}
                            onClick={() => {
                                const date = new Date(selectedDate);
                                date.setHours(hour, 0, 0, 0);
                                onSelectSlot(date);
                            }}
                            className={`slot-btn ${booked ? 'booked' : ''} ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                        >
                            <div className="slot-time">
                                <span className="time-display">{hour}:00</span>
                                <span className="time-range">- {hour + 1}:00</span>
                            </div>
                            <div className="slot-status">
                                {booked ? (
                                    <span className="status-icon">🚫</span>
                                ) : isPast ? (
                                    <span className="status-icon">⏰</span>
                                ) : isSelected ? (
                                    <span className="status-icon">✅</span>
                                ) : (
                                    <span className="status-icon">⚪</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
            
            {/* Legend */}
            <div className="slot-legend">
                <div className="legend-item">
                    <span className="legend-color available"></span>
                    <span>Available</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color selected"></span>
                    <span>Selected</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color booked"></span>
                    <span>Booked</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color past"></span>
                    <span>Past Time</span>
                </div>
            </div>
        </div>
    );
};

export default SlotSelector;
