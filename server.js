import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import API handlers
import mockPaymentHandler from './api/mock-pi-payment.js';
import createPaymentHandler from './api/pi-create-payment.js';
import metadataHandler from './api/metadata.js'; // Add metadata handler

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.get('/api/metadata', (req, res) => {
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
  
  // Call the metadata handler
  metadataHandler(mockRequest, mockResponse);
});

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

app.post('/api/pi-create-payment', (req, res) => {
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
  
  // Call the create payment handler
  createPaymentHandler(mockRequest, mockResponse);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});