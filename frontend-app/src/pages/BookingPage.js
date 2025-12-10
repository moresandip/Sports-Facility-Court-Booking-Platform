import React, { useState, useEffect } from 'react';
import SlotSelector from '../components/SlotSelector';
import BookingForm from '../components/BookingForm';

const BookingPage = () => {
    const [courts, setCourts] = useState([]);
    const [selectedCourt, setSelectedCourt] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Fetch courts on mount
    useEffect(() => {
        fetch('http://localhost:5001/api/courts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCourts(data);
                    if (data.length > 0) setSelectedCourt(data[0]);
                } else {
                    console.error("Courts data is not an array:", data);
                    setCourts([]);
                }
            })
            .catch(err => console.error("Error fetching courts:", err));
    }, []);

    // Fetch bookings when court or date changes
    useEffect(() => {
        if (selectedCourt) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            fetch(`http://localhost:5001/api/bookings?court=${selectedCourt._id}&date=${dateStr}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setBookings(data);
                    } else {
                        console.error("Bookings data is not an array:", data);
                        setBookings([]);
                    }
                })
                .catch(err => console.error("Error fetching bookings:", err));
        }
    }, [selectedCourt, selectedDate]);

    const handleSlotSelect = (date) => {
        setSelectedSlot(date);
        setBookingSuccess(false);
    };

    const handleBook = async (bookingData) => {
        // bookingData contains { coachId, equipment }
        // We need to construct the full payload
        const payload = {
            user: "guest_user", // Hardcoded for now
            courtId: selectedCourt._id,
            startTime: selectedSlot,
            endTime: new Date(selectedSlot.getTime() + 60 * 60 * 1000), // 1 hour duration
            ...bookingData
        };

        try {
            const res = await fetch('http://localhost:5001/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setBookingSuccess(true);
                setSelectedSlot(null);
                // Refresh bookings
                const dateStr = selectedDate.toISOString().split('T')[0];
                fetch(`http://localhost:5001/api/bookings?court=${selectedCourt._id}&date=${dateStr}`)
                    .then(r => r.json())
                    .then(d => {
                        if (Array.isArray(d)) setBookings(d);
                        else setBookings([]);
                    });
            } else {
                const err = await res.json();
                alert(`Booking failed: ${err.message}`);
            }
        } catch (error) {
            console.error("Booking error:", error);
            alert("Booking failed due to server error.");
        }
    };

    return (
        <div className="booking-page">
            {/* Hero Section */}
            <div className="hero-section">
                <h1>🏟️ Book Your Perfect Court</h1>
                <p>Choose from our premium sports facilities and book your slot instantly</p>
            </div>

            <div className="container">
                {/* Selection Cards */}
                <div className="selection-grid">
                    {/* Court Selection Card */}
                    <div className="card selection-card">
                        <div className="card-header">
                            <h3>🏀 Select Court</h3>
                            <div className="court-icon">🏟️</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Choose your preferred court</label>
                            <label className="form-label">Choose your preferred court</label>
                            <div className="court-list-container">
                                {courts.map(court => (
                                    <div
                                        key={court._id}
                                        className={`court-option ${selectedCourt?._id === court._id ? 'selected' : ''}`}
                                        onClick={() => setSelectedCourt(court)}
                                    >
                                        <div className="court-option-info">
                                            <span className="court-option-name">{court.name}</span>
                                            <span className="court-option-type">{court.type}</span>
                                        </div>
                                        <div className="court-option-price">${court.basePrice}/hr</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Date Selection Card */}
                    <div className="card selection-card">
                        <div className="card-header">
                            <h3>📅 Select Date</h3>
                            <div className="date-icon">📆</div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Pick your playing date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={selectedDate.toISOString().split('T')[0]}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            />
                        </div>
                    </div>
                </div>

                {/* Slot Selector */}
                {selectedCourt && (
                    <div className="card">
                        <div className="card-header">
                            <h3>⏰ Available Time Slots</h3>
                            <div className="slot-icon">🕐</div>
                        </div>
                        <SlotSelector
                            selectedDate={selectedDate}
                            selectedSlot={selectedSlot}
                            onSelectSlot={handleSlotSelect}
                            bookings={bookings}
                        />
                    </div>
                )}

                {/* Booking Form */}
                {selectedSlot && (
                    <div className="card booking-form-card">
                        <div className="card-header">
                            <h3>✅ Complete Your Booking</h3>
                            <div className="booking-icon">🎯</div>
                        </div>
                        <BookingForm
                            selectedSlot={selectedSlot}
                            court={selectedCourt}
                            onBook={handleBook}
                        />
                    </div>
                )}

                {/* Success Message */}
                {bookingSuccess && (
                    <div className="card success-card">
                        <div className="success-content">
                            <div className="success-icon">🎉</div>
                            <h3>Booking Confirmed!</h3>
                            <p>Your court has been successfully booked. Have a great game!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingPage;
