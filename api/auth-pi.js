// Simple test endpoint for /api/auth/pi that redirects to the consolidated Pi API handler
export default async function handler(request, response) {
  console.log('=== AUTH-PI TEST ENDPOINT ===');
  console.log('Request method:', request.method);
  console.log('Request URL:', request.url);
  console.log('Request headers:', request.headers);
  console.log('Request body:', request.body);
  
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }
  
  // Import and use the consolidated Pi API handler for auth action
  const piHandler = (await import('./pi.js')).default;
  
  // Create a modified request object with the auth action
  const modifiedRequest = {
    ...request,
    query: {
      action: 'auth'
    }
  };
  
  console.log('Redirecting to consolidated Pi API handler with auth action');
  return await piHandler(modifiedRequest, response);
}