// Test script to directly test the authentication endpoint
const http = require('http');

// Replace with your actual deployed URL
const apiUrl = 'http://localhost:3000/api/users'; // Change this to your actual URL

// Test data - you'll need to replace this with a valid Pi Network access token
const testData = {
  action: 'authenticate',
  data: {
    accessToken: 'your_test_token_here' // Replace with a valid token
  }
};

const postData = JSON.stringify(testData);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(apiUrl, options, (res) => {
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