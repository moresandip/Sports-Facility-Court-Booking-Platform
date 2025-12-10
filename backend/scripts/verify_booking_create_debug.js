// Native fetch is available in recent Node versions

const createBooking = async () => {
    try {
        // 1. Get a court ID first
        const courtRes = await fetch('http://localhost:5001/api/courts');
        const courts = await courtRes.json();

        if (courts.length === 0) {
            console.error('No courts found. Seed courts first.');
            return;
        }

        const courtId = courts[0]._id;
        console.log('Using Court ID:', courtId);

        // 2. Attempt to create a booking
        const today = new Date();
        // Set for tomorrow at 10 AM
        const start = new Date(today);
        start.setDate(today.getDate() + 1);
        start.setHours(10, 0, 0, 0);

        const end = new Date(start);
        end.setHours(11, 0, 0, 0);

        const payload = {
            user: "test_user",
            courtId: courtId,
            startTime: start,
            endTime: end,
            equipment: [], // Try empty first
            coachId: null
        };

        console.log('Sending payload:', JSON.stringify(payload, null, 2));

        const res = await fetch('http://localhost:5001/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await res.text();
        console.log(`Response Status: ${res.status}`);
        console.log('Response Body:', text);

    } catch (error) {
        console.error('Error running verification:', error);
    }
};

createBooking();
