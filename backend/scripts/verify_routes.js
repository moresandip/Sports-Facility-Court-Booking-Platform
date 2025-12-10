const http = require('http');

const testEndpoints = [
    '/api/pricing-rules',
    '/api/equipment',
    '/api/courts'
];

function testEndpoint(path) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:5000${path}`, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`GET ${path}: Status ${res.statusCode}`);
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const json = JSON.parse(data);
                        console.log('Response is valid JSON');
                        resolve(true);
                    } catch (e) {
                        console.log('Response is NOT JSON');
                        resolve(false);
                    }
                } else {
                    console.log('Response:', data);
                    resolve(false);
                }
            });
        }).on('error', (err) => {
            console.error(`Error requesting ${path}:`, err.message);
            resolve(false);
        });
    });
}

async function run() {
    console.log('Starting verification...');
    let success = true;
    for (const endpoint of testEndpoints) {
        if (!await testEndpoint(endpoint)) {
            success = false;
        }
    }
    if (success) {
        console.log('All endpoints reachable.');
        process.exit(0);
    } else {
        console.log('Some endpoints failed.');
        process.exit(1);
    }
}

setTimeout(run, 2000); // Wait for server to be fully ready
