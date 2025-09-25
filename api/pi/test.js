// Test endpoint to debug request body handling
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
  
  console.log('Test endpoint called');
  console.log('Request method:', request.method);
  console.log('Request headers:', request.headers);
  console.log('Request body:', request.body);
  console.log('Request body type:', typeof request.body);
  
  // Try to parse the body if it's a string
  let parsedBody = request.body;
  if (typeof request.body === 'string') {
    try {
      parsedBody = JSON.parse(request.body);
      console.log('Parsed body:', parsedBody);
    } catch (error) {
      console.error('Failed to parse body as JSON:', error);
      return response.status(400).json({ message: 'Invalid JSON in request body', error: error.message });
    }
  }
  
  response.status(200).json({ 
    message: 'Test endpoint working',
    requestBody: parsedBody,
    requestType: typeof request.body
  });
}