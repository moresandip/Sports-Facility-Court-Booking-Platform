const http = require('http');

const data = JSON.stringify({
    name: "Verification Court " + Date.now(),
    type: "indoor",
    basePrice: 60
});

const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/courts',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log(`Sending POST request to http://${options.hostname}:${options.port}${options.path}`);
const req = http.request(options, res => {
    console.log(`StatusCode: ${res.statusCode}`);

    let body = '';
    res.on('data', d => {
        body += d;
    });

    res.on('end', () => {
        console.log('Response:', body);
        if (res.statusCode === 201) {
            console.log('SUCCESS: Court added.');
            process.exit(0);
        } else {
            console.error('FAILURE: Court not added.');
            process.exit(1);
        }
    });
});

req.on('error', error => {
    console.error('Error sending request:', error);
    process.exit(1);
});

req.write(data);
req.end();
