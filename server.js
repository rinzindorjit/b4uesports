import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import API handlers
import mockPaymentHandler from './api/mock-pi-payment.js';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.post('/api/mock-pi-payment', (req, res) => {
  // Mock the Vercel request/response objects
  const mockRequest = {
    method: req.method,
    headers: req.headers,
    body: req.body,
    url: req.url
  };
  
  const mockResponse = {
    statusCode: 200,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      res.status(this.statusCode).json(data);
    },
    end() {
      res.status(this.statusCode).end();
    }
  };
  
  // Call the mock payment handler
  mockPaymentHandler(mockRequest, mockResponse);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});