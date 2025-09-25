// Test script for backend authentication endpoint
const http = require('http');

console.log('Testing backend authentication endpoint...');

// Test data
const testData = JSON.stringify({
  isMockAuth: true
});

console.log('Test data being sent:', testData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/pi',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('Sending test request to backend...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON response:', jsonData);
      
      if (res.statusCode === 200) {
        console.log('✅ Backend authentication test PASSED');
      } else {
        console.log('❌ Backend authentication test FAILED');
      }
    } catch (error) {
      console.log('Error parsing JSON response:', error);
      console.log('❌ Backend authentication test FAILED');
    }
  });
});

req.on('error', (error) => {
  console.log('Request error:', error);
  console.log('❌ Backend authentication test FAILED');
});

console.log('Writing data to request:', testData);
req.write(testData);
req.end();