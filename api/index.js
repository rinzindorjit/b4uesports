// Main API handler for Vercel
import authHandler from './pi/auth';
import paymentsHandler from './pi/payments';
import userHandler from './pi/user';
import webhookHandler from './pi/webhook';
import metadataHandler from './metadata';

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
  
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);
  
  // Route to appropriate handler based on path
  if (pathname === '/api/pi/auth') {
    return authHandler(request, response);
  } else if (pathname === '/api/pi/payments') {
    return paymentsHandler(request, response);
  } else if (pathname === '/api/pi/user') {
    return userHandler(request, response);
  } else if (pathname === '/api/pi/webhook') {
    return webhookHandler(request, response);
  } else if (pathname === '/api/metadata') {
    return metadataHandler(request, response);
  } else {
    response.status(404).json({ message: 'API endpoint not found' });
  }
}