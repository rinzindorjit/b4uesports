// Pi Network payment approval endpoint for Vercel
// Use built-in fetch when available (Node.js 18+ in Vercel) to avoid compatibility issues
const fetch = globalThis.fetch || (await import("node-fetch")).default;
import { withCORS } from '../utils/cors.js';

export default withCORS(paymentApprovalHandler);

async function paymentApprovalHandler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // In Vercel, the request body is already parsed as JSON
    const body = request.body || {};
    
    const { paymentId } = body;
    
    if (!paymentId) {
      return response.status(400).json({ message: 'Payment ID required' });
    }

    console.log("Approving payment with Pi Network, paymentId:", paymentId);
    console.log("PI_SERVER_API_KEY configured:", !!process.env.PI_SERVER_API_KEY);
    console.log("PI_SANDBOX_MODE:", process.env.PI_SANDBOX_MODE);
    console.log("PI_SANDBOX_MODE type:", typeof process.env.PI_SANDBOX_MODE);
    console.log("PI_SANDBOX_MODE truthy:", !!process.env.PI_SANDBOX_MODE);
    
    // Select correct endpoint based on sandbox mode - using user's suggested approach
    const piApiUrl = process.env.PI_SANDBOX_MODE 
      ? `https://sandbox.minepi.com/v2/payments/${paymentId}/approve`
      : `https://api.minepi.com/v2/payments/${paymentId}/approve`;

    console.log("Using Pi API URL:", piApiUrl);

    const piResponse = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "B4U-Esports-App/1.0"
      }
    });

    console.log("Pi Network API status:", piResponse.status);
    console.log("Pi Network API headers:", [...piResponse.headers.entries()]);

    const contentType = piResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await piResponse.text();
      console.error("Non-JSON response from Pi Network:", textResponse.substring(0, 500));

      return response.status(piResponse.status).json({
        error: "Invalid response from Pi Network",
        message: textResponse
      });
    }

    const data = await piResponse.json();

    if (!piResponse.ok) {
      console.error("Pi Network API error:", data);
      return response.status(piResponse.status).json({
        error: "Pi Network API error",
        details: data
      });
    }

    console.log("Payment approved successfully:", data);
    return response.status(200).json(data);

  } catch (error) {
    console.error("Payment approval error:", error);
    return response.status(500).json({
      error: "Payment approval failed",
      message: error.message,
      stack: error.stack
    });
  }
}