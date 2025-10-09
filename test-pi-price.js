// Test script to verify the Pi price endpoint
const http = require('http');

// Replace with your actual deployed URL
const host = 'localhost';
const port = 3000;
const path = '/api/pi-price';

const options = {
  hostname: host,
  port: port,
  path: path,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing Pi price endpoint...');

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
      console.log('Pi Price Response:', responseData);
      
      if (responseData.price) {
        console.log(`1 Pi = $${responseData.price.toFixed(6)} USD`);
        console.log(`Last updated: ${responseData.lastUpdated}`);
      }
    } catch (error) {
      console.log('Response (raw):', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();