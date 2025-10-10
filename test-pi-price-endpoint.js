// Test the new pi-price endpoint
import { createServer } from 'http';
import { readFileSync } from 'fs';
import piPriceHandler from './dist/api/pi-price.js';

// Create a simple server to test the pi-price endpoint
const server = createServer(async (req, res) => {
  // Add CORS headers for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Check if this is a request to /api/pi-price
  if (req.url === '/api/pi-price' && req.method === 'GET') {
    try {
      // Call the pi-price handler
      await piPriceHandler(req, res);
    } catch (error) {
      console.error('Pi-price API Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Testing /api/pi-price endpoint...');
  
  // Give the server a moment to start
  setTimeout(() => {
    // Test the pi-price endpoint
    fetch(`http://localhost:${PORT}/api/pi-price`)
      .then(res => {
        console.log('Response status:', res.status);
        console.log('Response headers:', [...res.headers.entries()]);
        return res.text();
      })
      .then(text => {
        console.log('Raw response text:', JSON.stringify(text));
        try {
          const data = JSON.parse(text);
          console.log('Parsed JSON data:', data);
        } catch (e) {
          console.error('Failed to parse JSON:', e);
        }
      })
      .catch(err => console.error('Pi price error:', err));
  }, 1000);
});