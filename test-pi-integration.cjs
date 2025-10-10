// Test script to verify Pi Network integration
const http = require('http');

// Test the API endpoints
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

console.log('Testing Pi Network integration...');

const req = http.request(options, (res) => {
  let data = '';
  
  console.log(`Health check status: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const responseData = JSON.parse(data);
      console.log('Health check response:', responseData);
      
      // Test Pi price endpoint
      const priceOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/pi-price',
        method: 'GET'
      };
      
      const priceReq = http.request(priceOptions, (priceRes) => {
        let priceData = '';
        
        console.log(`Pi price status: ${priceRes.statusCode}`);
        
        priceRes.on('data', (chunk) => {
          priceData += chunk;
        });
        
        priceRes.on('end', () => {
          try {
            const priceResponse = JSON.parse(priceData);
            console.log('Pi price response:', priceResponse);
            console.log('✅ Pi Network integration test completed successfully');
          } catch (error) {
            console.log('Pi price response (raw):', priceData);
          }
        });
      });
      
      priceReq.on('error', (error) => {
        console.error('Pi price request error:', error);
      });
      
      priceReq.end();
      
    } catch (error) {
      console.log('Health check response (raw):', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Health check request error:', error);
});

req.end();