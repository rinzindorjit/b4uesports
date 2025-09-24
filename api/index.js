// Main API handler for Vercel
import authHandler from './pi/auth.js';
import paymentsHandler from './pi/payments.js';
import userHandler from './pi/user.js';
import webhookHandler from './pi/webhook.js';
import metadataHandler from './metadata.js';

export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  // Extract the path from the request
  const url = new URL(request.url, `http://${request.headers.host}`);
  const path = url.pathname;
  
  // Route to appropriate handler based on path
  try {
    if (path === '/api/pi/auth') {
      return await authHandler(request, response);
    } else if (path === '/api/pi/payments') {
      return await paymentsHandler(request, response);
    } else if (path === '/api/pi/user') {
      return await userHandler(request, response);
    } else if (path === '/api/pi/webhook') {
      return await webhookHandler(request, response);
    } else if (path === '/api/metadata') {
      return await metadataHandler(request, response);
    } else {
      response.status(404).json({ message: `API endpoint not found: ${path}` });
    }
  } catch (error) {
    console.error('API handler error:', error);
    response.status(500).json({ message: 'Internal server error' });
  }
}