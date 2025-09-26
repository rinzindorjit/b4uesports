// /api/pi/create-payment.js
// This endpoint handles payment creation by calling the Pi Network API
// All Pi Network API calls must go through serverless functions for security

import fetch from "node-fetch";

export default async function handler(req, res) {
  // This endpoint should not be used to create payments directly
  // Payments should be created using the client-side Pi SDK
  // This is kept for backward compatibility but should redirect to proper flow
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Log the attempt for debugging
  console.log("WARNING: Direct call to /api/pi/create-payment detected");
  console.log("This endpoint should not be called directly in production");
  console.log("Payments should be created using the client-side Pi SDK");

  // Check if PI_SERVER_API_KEY is configured
  if (!process.env.PI_SERVER_API_KEY || process.env.PI_SERVER_API_KEY === 'your_actual_pi_server_api_key_here') {
    console.error('PI_SERVER_API_KEY not configured properly');
    return res.status(500).json({ 
      message: 'PI_SERVER_API_KEY not configured properly', 
      error: 'Missing PI_SERVER_API_KEY environment variable' 
    });
  }

  try {
    // Use the correct Pi Network API endpoint
    // According to the analysis, we should use https://api.minepi.com/v2/payments for both testnet and mainnet
    const piApiUrl = 'https://api.minepi.com/v2/payments';
    
    // Prepare the payment data from the request body
    const paymentData = req.body?.paymentData || {};
    
    console.log('Creating payment with data:', paymentData);
    
    // Make the API call to Pi Network with proper headers
    const response = await fetch(piApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_SERVER_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add User-Agent header to avoid being treated as a browser request
        'User-Agent': 'B4U-Esports-App/1.0'
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        memo: paymentData.memo,
        metadata: paymentData.metadata
      })
    });
    
    console.log('Pi Network API response status:', response.status);
    
    // Check if the response is JSON before trying to parse it
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Non-JSON response from Pi Network:', textResponse.substring(0, 500));
      
      // If we get a 403 error, it's likely due to hitting the CDN instead of the API
      if (response.status === 403) {
        return res.status(403).json({
          error: 'Pi Network API access blocked',
          message: 'This distribution is not configured to allow the HTTP request method that was used for this request. The distribution supports only cachable requests.',
          details: 'Make sure you are calling https://api.minepi.com/v2/payments and not sandbox.minepi.com',
          responsePreview: textResponse.substring(0, 500)
        });
      }
      
      return res.status(response.status).json({
        error: 'Invalid response from Pi Network',
        responsePreview: textResponse.substring(0, 500),
        contentType: contentType
      });
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Pi Network API error:', data);
      return res.status(response.status).json({
        error: 'Pi Network API error',
        details: data
      });
    }
    
    console.log('Payment created successfully:', data);
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({
      error: 'Payment creation failed',
      message: error.message,
      stack: error.stack
    });
  }
}