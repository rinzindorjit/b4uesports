// Pi Network payment completion endpoint for Vercel
// Use built-in fetch when available (Node.js 18+ in Vercel)
const fetch = globalThis.fetch || (await import('node-fetch')).default;
import { withCORS } from '../utils/cors.js';

export default withCORS(paymentCompletionHandler);

async function paymentCompletionHandler(request, response) {
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
    
    const { paymentId, txid } = body;
    
    if (!paymentId || !txid) {
      return response.status(400).json({ message: 'Payment ID and txid required' });
    }

    if (!process.env.PI_SERVER_API_KEY || process.env.PI_SERVER_API_KEY === 'your_actual_pi_server_api_key_here') {
      console.error('PI_SERVER_API_KEY not configured properly');
      return response.status(500).json({ 
        message: 'PI_SERVER_API_KEY not configured properly', 
        error: 'Missing PI_SERVER_API_KEY environment variable' 
      });
    }

    console.log("Completing payment with Pi Network, paymentId:", paymentId, "txid:", txid);
    console.log("Using API key starting with:", process.env.PI_SERVER_API_KEY?.substring(0, 10) || "NOT SET");
    
    // For Pi Network testing, we always use the sandbox endpoint unless explicitly set to false
    // This is because Pi requires using sandbox.minepi.com for testnet even in production deployments
    const useSandbox = process.env.PI_SANDBOX_MODE !== 'false';
    
    const piApiUrl = useSandbox 
      ? `https://sandbox.minepi.com/v2/payments/${paymentId}/complete` 
      : `https://api.minepi.com/v2/payments/${paymentId}/complete`;
      
    console.log(`Environment: PI_SANDBOX_MODE=${process.env.PI_SANDBOX_MODE}`);
    console.log(`Using Pi API URL for completion: ${piApiUrl}`);
      
    const piResponse = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "B4U-Esports-App/1.0",
        "Cache-Control": "no-cache"
      },
      body: JSON.stringify({
        txid: txid
      })
    });

    console.log("Pi Network completion response status:", piResponse.status);
    console.log("Pi Network completion response headers:", [...piResponse.headers.entries()]);
    
    // Check if the response is JSON before trying to parse it
    const contentType = piResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await piResponse.text();
      console.error("Non-JSON response from Pi Network:", textResponse.substring(0, 500));
      return response.status(piResponse.status).json({ 
        error: "Invalid response from Pi Network",
        responsePreview: textResponse.substring(0, 500),
        contentType: contentType
      });
    }

    const data = await piResponse.json();

    if (!piResponse.ok) {
      console.error("Payment completion error:", data);
      return response.status(piResponse.status).json({ error: data });
    }

    console.log("Payment completed successfully:", data);

    return response.status(200).json({
      success: true,
      paymentData: data
    });

  } catch (error) {
    console.error("Payment completion exception:", error);
    console.error("Error stack:", error.stack);
    
    // If it's a fetch error, provide more details
    if (error.type === 'system' || error.code) {
      return response.status(500).json({ 
        error: "Network error when calling Pi Network API",
        details: {
          type: error.type,
          code: error.code,
          message: error.message
        }
      });
    }
    
    return response.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}