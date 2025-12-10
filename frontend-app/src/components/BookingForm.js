import React, { useState, useEffect } from 'react';

const BookingForm = ({ selectedSlot, court, onBook }) => {
    const [coaches, setCoaches] = useState([]);
    const [equipmentList, setEquipmentList] = useState([]);

    const [selectedCoach, setSelectedCoach] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState({}); // { equipmentId: quantity }

    const [price, setPrice] = useState(null);

    // Fetch resources on mount
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [coachesRes, equipmentRes] = await Promise.all([
                    fetch('http://localhost:5001/api/coaches').then(r => r.json()),
                    fetch('http://localhost:5001/api/equipment').then(r => r.json())
                ]);
                setCoaches(coachesRes);
                setEquipmentList(equipmentRes);
            } catch (err) {
                console.error("Failed to fetch resources", err);
            }
        };
        fetchResources();
    }, []);

    // Calculate price locally for immediate feedback (simplified)
    // Ideally, we might hit an API endpoint /calculate-price to get the exact server-side calculation
    // For now, let's just show a "Calculate Price" button or do it on submit?
    // The requirement says "Live Price Display".
    // Let's try to replicate the logic or just show base price + add-ons.

    const calculateEstimatedPrice = async () => {
        if (!court || !selectedSlot) return;

        const endTime = new Date(selectedSlot.getTime() + 60 * 60 * 1000); // 1 hour default
        const equipmentPayload = Object.entries(selectedEquipment)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => ({ item: id, quantity: qty }));

        try {
            const res = await fetch('http://localhost:5001/api/bookings/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courtId: court._id,
                    startTime: selectedSlot,
                    endTime: endTime,
                    coachId: selectedCoach || null,
                    equipment: equipmentPayload
                })
            });
            const data = await res.json();
            setPrice(data);
        } catch (err) {
            console.error("Error calculating price:", err);
        }
    };

    useEffect(() => {
        calculateEstimatedPrice();
    }, [court, selectedSlot, selectedCoach, selectedEquipment]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Format equipment for API: [{ item: id, quantity: qty }]
        const equipmentPayload = Object.entries(selectedEquipment)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => ({ item: id, quantity: qty }));

        onBook({
            coachId: selectedCoach || null,
            equipment: equipmentPayload
        });
    };

    if (!selectedSlot || !court) return null;

    return (
        <div className="booking-form">
            <div className="booking-summary">
                <h4>📋 Booking Summary</h4>
                <div className="summary-grid">
                    <div className="summary-item">
                        <span className="summary-icon">🏟️</span>
                        <div className="summary-content">
                            <strong>Court</strong>
                            <span>{court.name} ({court.type})</span>
                        </div>
                    </div>
                    <div className="summary-item">
                        <span className="summary-icon">🕐</span>
                        <div className="summary-content">
                            <strong>Time</strong>
                            <span>{selectedSlot.toLocaleDateString()}</span>
                            <span>{selectedSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="booking-options">
                <div className="option-section">
                    <h5>🏃‍♂️ Coach Services (Optional)</h5>
                    <div className="form-group">
                        <select
                            className="form-control"
                            value={selectedCoach}
                            onChange={e => setSelectedCoach(e.target.value)}
                        >
                            <option value="">No coach needed</option>
                            {coaches.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.name} - ${c.hourlyRate}/hr
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="option-section">
                    <h5>🎾 Equipment Rental (Optional)</h5>
                    <div className="equipment-grid">
                        {equipmentList.map(item => (
                            <div key={item._id} className="equipment-item">
                                <div className="equipment-info">
                                    <span className="equipment-name">{item.name}</span>
                                    <span className="equipment-price">+${item.rentalPrice}</span>
                                </div>
                                <div className="quantity-controls">
                                    <button
                                        type="button"
                                        className="quantity-btn"
                                        onClick={() => {
                                            const currentQty = selectedEquipment[item._id] || 0;
                                            if (currentQty > 0) {
                                                setSelectedEquipment({
                                                    ...selectedEquipment,
                                                    [item._id]: currentQty - 1
                                                });
                                            }
                                        }}
                                        disabled={(selectedEquipment[item._id] || 0) <= 0}
                                    >
                                        -
                                    </button>
                                    <span className="quantity-display">{selectedEquipment[item._id] || 0}</span>
                                    <button
                                        type="button"
                                        className="quantity-btn"
                                        onClick={() => {
                                            const currentQty = selectedEquipment[item._id] || 0;
                                            if (currentQty < item.availableStock) {
                                                setSelectedEquipment({
                                                    ...selectedEquipment,
                                                    [item._id]: currentQty + 1
                                                });
                                            }
                                        }}
                                        disabled={(selectedEquipment[item._id] || 0) >= item.availableStock}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Display */}
                <div className="price-display">
                    <div className="price-header">
                        <h5>💰 Total Price</h5>
                        {price && (
                            <div className="price-breakdown-toggle" onClick={() => { }}>
                                📊 View Breakdown
                            </div>
                        )}
                    </div>
                    <div className="price-amount">
                        {price ? (
                            <>
                                <span className="total-price">${price.total.toFixed(2)}</span>
                                {price.total > 0 && (
                                    <div className="price-details">
                                        <span>Base: ${price.basePrice?.toFixed(2)}</span>
                                        {price.peakHourFee > 0 && <span>Peak: ${price.peakHourFee.toFixed(2)}</span>}
                                        {price.weekendFee > 0 && <span>Weekend: ${price.weekendFee.toFixed(2)}</span>}
                                        {price.equipmentFee > 0 && <span>Equipment: ${price.equipmentFee.toFixed(2)}</span>}
                                        {price.coachFee > 0 && <span>Coach: ${price.coachFee.toFixed(2)}</span>}
                                    </div>
                                )}
                            </>
                        ) : (
                            <span className="loading-price">
                                <div className="loading"></div>
                                Calculating...
                            </span>
                        )}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary booking-submit">
                    <span className="btn-icon">✅</span>
                    Confirm Booking
                </button>
            </form>
        </div>
    );
};

export default BookingForm;
