// Netlify Function wrapper for the existing API handler

// Import the existing API handler
import apiHandler from '../../api/index.js';

// Netlify Function handler
export async function handler(event, context) {
  console.log('=== NETLIFY FUNCTION DEBUG ===');
  console.log('Event received:', JSON.stringify(event, null, 2));
  console.log('Context received:', JSON.stringify(context, null, 2));
  
  // Create a mock request object that matches what the API handler expects
  const request = {
    method: event.httpMethod,
    url: event.path,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : null
  };
  
  console.log('Created request object:', JSON.stringify(request, null, 2));
  console.log('=== END NETLIFY FUNCTION DEBUG ===');

  // Create a mock response object
  let responseSent = false;
  let responseStatus = 200;
  let responseHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
  let responseBody = '';

  const response = {
    setHeader: (name, value) => {
      responseHeaders[name] = value;
      return response;
    },
    status: (code) => {
      responseStatus = code;
      return response;
    },
    json: (data) => {
      responseSent = true;
      responseBody = JSON.stringify(data);
      return response;
    },
    end: (data) => {
      responseSent = true;
      responseBody = data || '';
      return response;
    }
  };

  try {
    // Call the existing API handler
    await apiHandler(request, response);
    
    // Return the response in Netlify Function format
    return {
      statusCode: responseStatus,
      headers: responseHeaders,
      body: responseBody
    };
  } catch (error) {
    console.error('Netlify Function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error.message
      })
    };
  }
}