// Test the Vercel API handler locally
const http = require('http');
const { default: handler } = require('./dist/api/index.js');

// Create a simple server to test the API
const server = http.createServer(async (req, res) => {
  // Mock the Vercel request object
  const mockReq = {
    url: req.url,
    method: req.method,
    headers: req.headers,
  };
  
  // Mock the Vercel response object
  const mockRes = {
    status: (code) => {
      res.statusCode = code;
      return mockRes;
    },
    json: (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    },
    end: () => {
      res.end();
    },
    setHeader: (name, value) => {
      res.setHeader(name, value);
    }
  };
  
  // Call the handler
  await handler(mockReq, mockRes);
});

server.listen(3002, () => {
  console.log('Test server running on port 3002');
  console.log('Test the packages endpoint at http://localhost:3002/api/packages');
});