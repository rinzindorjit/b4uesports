// Test script to directly test the authentication endpoint
const http = require('http');

// Replace with your actual deployed URL
const host = 'localhost';
const port = 3000;
const path = '/api/users';

// Test data - you'll need to replace this with a valid Pi Network access token
const testData = {
  action: 'authenticate',
  data: {
    accessToken: 'your_test_token_here' // Replace with a valid token
  }
};

const postData = JSON.stringify(testData);

const options = {
  hostname: host,
  port: port,
  path: path,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing authentication endpoint...');
console.log('Request data:', testData);

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const responseData = JSON.parse(data);
      console.log('Response:', responseData);
    } catch (error) {
      console.log('Response (raw):', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(postData);
req.end();