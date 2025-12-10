import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
    const [courts, setCourts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [newCourt, setNewCourt] = useState({ name: '', type: 'indoor', basePrice: 0 });

    useEffect(() => {
        fetchCourts();
        fetchBookings();
    }, []);

    const fetchCourts = () => {
        fetch('http://localhost:5001/api/courts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCourts(data);
                } else {
                    console.error("Courts data is not an array:", data);
                    setCourts([]);
                }
            })
            .catch(err => console.error("Error fetching courts:", err));
    };

    const fetchBookings = () => {
        fetch('http://localhost:5001/api/bookings')
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
    };

    const handleAddCourt = async (e) => {
        e.preventDefault();
        try {
            // Ensure basePrice is a number
            const payload = {
                ...newCourt,
                basePrice: Number(newCourt.basePrice) || 0
            };

            const res = await fetch('http://localhost:5001/api/courts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Try to parse JSON safely
            let data;
            try {
                data = await res.json();
            } catch (parseErr) {
                const text = await res.text();
                console.error('Failed to parse JSON response:', text);
                throw new Error(text || 'Unexpected server response');
            }

            if (!res.ok) {
                throw new Error(data.message || 'Failed to create court');
            }

            // Success
            fetchCourts();
            setNewCourt({ name: '', type: 'indoor', basePrice: 0 });
            alert('Court added successfully!');
        } catch (err) {
            console.error('Error adding court:', err);
            // Provide helpful message in UI
            alert(`Error adding court: ${err.message || 'Server error'}`);
        }
    };

    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.pricingBreakdown?.total || 0), 0);
    const todayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.startTime).toDateString();
        const today = new Date().toDateString();
        return bookingDate === today;
    }).length;

    return (
        <div className="admin-dashboard">
            {/* Hero Section */}
            <div className="hero-section">
                <h1>⚙️ Admin Dashboard</h1>
                <p>Manage your sports facility and monitor all bookings</p>
            </div>

            <div className="container">
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="card stats-card">
                        <div className="stats-icon">🏟️</div>
                        <div className="stats-content">
                            <h3>{courts.length}</h3>
                            <p>Total Courts</p>
                        </div>
                    </div>
                    <div className="card stats-card">
                        <div className="stats-icon">📅</div>
                        <div className="stats-content">
                            <h3>{todayBookings}</h3>
                            <p>Today's Bookings</p>
                        </div>
                    </div>
                    <div className="card stats-card">
                        <div className="stats-icon">💰</div>
                        <div className="stats-content">
                            <h3>${totalRevenue.toFixed(2)}</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>
                    <div className="card stats-card">
                        <div className="stats-icon">📊</div>
                        <div className="stats-content">
                            <h3>{bookings.length}</h3>
                            <p>All Bookings</p>
                        </div>
                    </div>
                </div>

                {/* Court Management Section */}
                <div className="card">
                    <div className="card-header">
                        <h3>🏀 Manage Courts</h3>
                        <div className="management-icon">⚙️</div>
                    </div>

                    <div className="court-list">
                        <h4>Existing Courts</h4>
                        <div className="courts-grid">
                            {courts.map(court => (
                                <div key={court._id} className="court-item">
                                    <div className="court-info">
                                        <div className="court-icon">🏟️</div>
                                        <div className="court-details">
                                            <h5>{court.name}</h5>
                                            <div className="court-meta">
                                                <span className={`court-type ${court.type}`}>{court.type}</span>
                                                <span className="court-price">${court.basePrice}/hr</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="add-court-section">
                        <h4>➕ Add New Court</h4>
                        <form onSubmit={handleAddCourt} className="add-court-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Court Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter court name"
                                        value={newCourt.name}
                                        onChange={e => setNewCourt({ ...newCourt, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Court Type</label>
                                    <select
                                        className="form-control"
                                        value={newCourt.type}
                                        onChange={e => setNewCourt({ ...newCourt, type: e.target.value })}
                                    >
                                        <option value="indoor">Indoor</option>
                                        <option value="outdoor">Outdoor</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Base Price ($/hr)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="0"
                                        value={newCourt.basePrice}
                                        onChange={e => setNewCourt({ ...newCourt, basePrice: parseFloat(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">
                                <span className="btn-icon">➕</span>
                                Add Court
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bookings Management Section */}
                <div className="card">
                    <div className="card-header">
                        <h3>📋 All Bookings</h3>
                        <div className="bookings-icon">📊</div>
                    </div>

                    <div className="bookings-table-container">
                        {bookings.length === 0 ? (
                            <div className="no-bookings">
                                <div className="no-bookings-icon">📭</div>
                                <h4>No bookings yet</h4>
                                <p>Bookings will appear here once customers start making reservations.</p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table className="bookings-table">
                                    <thead>
                                        <tr>
                                            <th>📅 Date & Time</th>
                                            <th>🏟️ Court</th>
                                            <th>👤 User</th>
                                            <th>💰 Total</th>
                                            <th>📊 Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map(booking => (
                                            <tr key={booking._id}>
                                                <td className="booking-datetime">
                                                    <div className="date">{new Date(booking.startTime).toLocaleDateString()}</div>
                                                    <div className="time">{new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td className="booking-court">
                                                    <div className="court-name">{booking.court?.name}</div>
                                                    <div className="court-type">{booking.court?.type}</div>
                                                </td>
                                                <td className="booking-user">
                                                    <span className="user-name">{booking.user}</span>
                                                </td>
                                                <td className="booking-total">
                                                    <span className="total-amount">${booking.pricingBreakdown?.total?.toFixed(2)}</span>
                                                    {booking.pricingBreakdown && (
                                                        <div className="price-breakdown">
                                                            <small>Base: ${booking.pricingBreakdown.basePrice?.toFixed(2)}</small>
                                                            {booking.pricingBreakdown.equipmentFee > 0 && (
                                                                <small>Equipment: ${booking.pricingBreakdown.equipmentFee.toFixed(2)}</small>
                                                            )}
                                                            {booking.pricingBreakdown.coachFee > 0 && (
                                                                <small>Coach: ${booking.pricingBreakdown.coachFee.toFixed(2)}</small>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="booking-status">
                                                    <span className={`status-badge ${booking.status}`}>
                                                        {booking.status === 'confirmed' ? '✅' : '⏳'} {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
