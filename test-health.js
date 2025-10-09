// Test script to check the health endpoint
const http = require('http');

// Replace with your actual deployed URL
const host = 'localhost';
const port = 3000;
const path = '/api/health';

const options = {
  hostname: host,
  port: port,
  path: path,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing health endpoint...');

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
      console.log('Health check response:', responseData);
    } catch (error) {
      console.log('Response (raw):', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();