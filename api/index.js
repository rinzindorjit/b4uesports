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
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const path = url.pathname;
    
    console.log('API request received:', { 
      method: request.method, 
      path, 
      url: request.url, 
      headers: request.headers,
      body: request.body
    });
    
    // Route to appropriate handler based on path
    if (path === '/api/pi/auth') {
      console.log('Routing to auth handler');
      return await authHandler(request, response);
    } else if (path === '/api/pi/payments') {
      console.log('Routing to payments handler');
      return await paymentsHandler(request, response);
    } else if (path === '/api/pi/user') {
      console.log('Routing to user handler');
      return await userHandler(request, response);
    } else if (path === '/api/pi/webhook') {
      console.log('Routing to webhook handler');
      return await webhookHandler(request, response);
    } else if (path === '/api/metadata') {
      console.log('Routing to metadata handler');
      return await metadataHandler(request, response);
    } else {
      console.log('API endpoint not found:', path);
      response.status(404).json({ message: `API endpoint not found: ${path}` });
    }
  } catch (error) {
    console.error('API handler error:', error);
    console.error('Error stack:', error.stack);
    response.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: error.stack
    });
  }
}