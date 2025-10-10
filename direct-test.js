// Direct test of the API handler function
import apiModule from './dist/api/index.js';

// Extract the handler function from the default export
const handler = apiModule.default;

// Mock request and response objects
const createMockRequest = (url, method = 'GET', headers = {}) => ({
  url,
  method,
  headers,
  on: (event, callback) => {
    // For testing, we don't need to simulate data events
    if (event === 'error') {
      // Don't trigger error events in tests
    }
  }
});

const createMockResponse = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = JSON.stringify(data);
      console.log(`Status: ${this.statusCode}`);
      console.log(`Headers:`, this.headers);
      console.log(`Body:`, data);
      return this;
    },
    end(data) {
      this.body = data || '';
      console.log(`Status: ${this.statusCode}`);
      console.log(`Headers:`, this.headers);
      console.log(`Body:`, this.body);
      return this;
    }
  };
  return res;
};

// Test the health endpoint
console.log('Testing /api/health endpoint:');
const healthReq = createMockRequest('/api/health', 'GET');
const healthRes = createMockResponse();
await handler(healthReq, healthRes);

// Test the pi-price endpoint
console.log('\nTesting /api/pi-price endpoint:');
const piPriceReq = createMockRequest('/api/pi-price', 'GET');
const piPriceRes = createMockResponse();
await handler(piPriceReq, piPriceRes);

// Test the root endpoint
console.log('\nTesting root endpoint:');
const rootReq = createMockRequest('/api/', 'GET');
const rootRes = createMockResponse();
await handler(rootReq, rootRes);