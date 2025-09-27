import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the consolidated API handler
import handlePiApi from './api/index.js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3005'],
  credentials: true
}));
app.use(express.json());

// API routes - Updated to use the consolidated handler
// Specific route for /api/auth/pi for backward compatibility
app.all('/api/auth/pi', (req, res) => {
  // Mock the Vercel request/response objects to match what our handler expects
  const mockRequest = {
    method: req.method,
    headers: req.headers,
    body: req.body,
    url: req.url,
    query: { action: 'auth' } // Add the auth action parameter
  };
  
  const mockResponse = {
    statusCode: 200,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
      res.setHeader(key, value);
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
  
  // Call the consolidated API handler
  handlePiApi(mockRequest, mockResponse);
});

// General API route for all other /api/* endpoints
app.all('/api/*', (req, res) => {
  // Mock the Vercel request/response objects to match what our handler expects
  const mockRequest = {
    method: req.method,
    headers: req.headers,
    body: req.body,
    url: req.url,
    query: req.query
  };
  
  const mockResponse = {
    statusCode: 200,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
      res.setHeader(key, value);
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
  
  // Call the consolidated API handler
  handlePiApi(mockRequest, mockResponse);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});