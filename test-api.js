// Simple test script to verify API endpoints
import { createServer } from 'http';
import { parse } from 'url';

// Import the API handler
import handler from './dist/api/index.js';

// Create a simple server to test the API
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
  
  try {
    // Call the API handler
    await handler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Test API server running on http://localhost:${PORT}`);
  console.log('Testing API endpoints...');
  
  // Give the server a moment to start
  setTimeout(() => {
    // Test the health endpoint
    fetch(`http://localhost:${PORT}/api/health`)
      .then(res => res.json())
      .then(data => console.log('Health check:', data))
      .catch(err => console.error('Health check error:', err));
      
    // Test the pi-price endpoint
    fetch(`http://localhost:${PORT}/api/pi-price`)
      .then(res => res.json())
      .then(data => console.log('Pi price:', data))
      .catch(err => console.error('Pi price error:', err));
  }, 1000);
});