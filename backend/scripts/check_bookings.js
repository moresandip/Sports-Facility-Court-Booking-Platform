const fetch = require('node-fetch');

async function checkBookings() {
    try {
        const res = await fetch('http://localhost:5000/api/bookings');
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Is Array:", Array.isArray(data));
        console.log("Count:", Array.isArray(data) ? data.length : 'N/A');
        if (Array.isArray(data) && data.length > 0) {
            console.log("First Booking User:", data[0].user);
            console.log("First Booking Full Data:", JSON.stringify(data[0], null, 2));
        } else {
            console.log("Data:", data);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

checkBookings();
