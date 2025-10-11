import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

// Utility functions for reading request body
async function readBody(req: VercelRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (err) {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

// Determine if we're in sandbox (Testnet) mode
// Safely check for environment variables
const isSandbox = (process.env.PI_SANDBOX === 'true') || (process.env.NODE_ENV !== 'production');
const PI_API_BASE_URL = isSandbox ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';

console.log(`Pi Network service initialized in ${isSandbox ? 'SANDBOX (Testnet)' : 'PRODUCTION (Mainnet)'} mode`);

// Vercel-compatible Pi Network payments handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight requests for 24 hours

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed. Only POST requests are allowed." });
  }

  console.log('Pi Network mode: ' + (isSandbox ? 'SANDBOX (Testnet)' : 'PRODUCTION'));
  console.log('Pi Network endpoint: ' + PI_API_BASE_URL);

  try {
    // Parse request body
    const body: any = await readBody(req);
    const { action, data } = body as { action: string; data: any };
    
    // Validate action parameter
    if (!action) {
      return res.status(400).json({ message: "Missing action parameter" });
    }

    // Check if PI_SERVER_API_KEY is configured
    const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY;
    if (!PI_SERVER_API_KEY) {
      console.error('PI_SERVER_API_KEY is not configured in environment variables');
      return res.status(500).json({ 
        message: 'Payment service not properly configured. Please contact administrator.' 
      });
    }

    console.log('PI_SERVER_API_KEY configured:', !!PI_SERVER_API_KEY);

    switch (action) {
      case 'approve':
        try {
          // Validate required data
          if (!data || !data.paymentId) {
            return res.status(400).json({ message: "paymentId is required" });
          }

          const { paymentId } = data;
          
          console.log('Approving payment: ' + paymentId);

          // Log the request details for debugging
          console.log('Making request to Pi Network API:');
          console.log('- URL:', `${PI_API_BASE_URL}/payments/${paymentId}/approve`);
          console.log('- Headers:', {
            'Authorization': `Key ${PI_SERVER_API_KEY.substring(0, 5)}...`, // Log only first 5 chars for security
            'Content-Type': 'application/json',
          });

          // Approve payment with Pi Network
          const response = await axios.post(
            `${PI_API_BASE_URL}/payments/${paymentId}/approve`,
            {},
            {
              headers: {
                'Authorization': `Key ${PI_SERVER_API_KEY}`,
                'Content-Type': 'application/json',
              },
              // Add timeout to prevent hanging
              timeout: 15000, // 15 second timeout
              // Ensure we're not following redirects
              maxRedirects: 0,
              // Validate status to catch non-2xx responses
              validateStatus: (status) => status < 500, // Accept all statuses to handle them manually
            }
          );
          
          console.log(`Pi Network API response status:`, response.status);
          console.log(`Pi Network API response headers:`, response.headers);
          
          // Check if we got HTML content (which indicates an error)
          const contentType = response.headers['content-type'];
          if (contentType && contentType.includes('text/html')) {
            console.error('❌ Received HTML response instead of JSON - likely a CloudFront error');
            return res.status(500).json({ 
              message: "Payment approval failed - received HTML error page",
              error: "CloudFront blocked the request - check API key and permissions",
              status: response.status
            });
          }
          
          // Check for successful response
          if (response.status >= 200 && response.status < 300) {
            console.log(`✅ Payment approved on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId);
            return res.json({
              message: "Payment approved successfully",
              payment: response.data,
              status: "approved"
            });
          } else {
            console.error("❌ Approval error:", response.status, response.data);
            return res.status(response.status).json({ 
              message: "Payment approval failed",
              error: response.data,
              status: response.status
            });
          }
        } catch (error: any) {
          console.error("❌ Approval error:", error.response?.data || error.message);
          // Return more detailed error information
          return res.status(500).json({ 
            message: "Payment approval failed",
            error: error.response?.data || error.message,
            status: error.response?.status
          });
        }

      case 'complete':
        try {
          // Validate required data
          if (!data || !data.paymentId || !data.txid) {
            return res.status(400).json({ 
              message: "paymentId and txid are required for completion" 
            });
          }

          const { paymentId, txid } = data;
          
          console.log('Completing payment: ' + paymentId + ' with txid: ' + txid);

          // Log the request details for debugging
          console.log('Making request to Pi Network API:');
          console.log('- URL:', `${PI_API_BASE_URL}/payments/${paymentId}/complete`);
          console.log('- Headers:', {
            'Authorization': `Key ${PI_SERVER_API_KEY.substring(0, 5)}...`, // Log only first 5 chars for security
            'Content-Type': 'application/json',
          });
          console.log('- Body:', { txid });

          // Complete payment with Pi Network
          const response = await axios.post(
            `${PI_API_BASE_URL}/payments/${paymentId}/complete`,
            { txid },
            {
              headers: {
                'Authorization': `Key ${PI_SERVER_API_KEY}`,
                'Content-Type': 'application/json',
              },
              // Add timeout to prevent hanging
              timeout: 15000, // 15 second timeout
              // Ensure we're not following redirects
              maxRedirects: 0,
              // Validate status to catch non-2xx responses
              validateStatus: (status) => status < 500, // Accept all statuses to handle them manually
            }
          );
          
          console.log(`Pi Network API response status:`, response.status);
          console.log(`Pi Network API response headers:`, response.headers);
          
          // Check if we got HTML content (which indicates an error)
          const contentType = response.headers['content-type'];
          if (contentType && contentType.includes('text/html')) {
            console.error('❌ Received HTML response instead of JSON - likely a CloudFront error');
            return res.status(500).json({ 
              message: "Payment completion failed - received HTML error page",
              error: "CloudFront blocked the request - check API key and permissions",
              status: response.status
            });
          }
          
          // Check for successful response
          if (response.status >= 200 && response.status < 300) {
            console.log(`✅ Payment completed on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId, "TXID:", txid);
            return res.json({ 
              message: "Payment completed successfully",
              payment: response.data,
              status: "completed"
            });
          } else {
            console.error("❌ Completion error:", response.status, response.data);
            return res.status(response.status).json({ 
              message: "Payment completion failed",
              error: response.data,
              status: response.status
            });
          }
        } catch (error: any) {
          console.error("❌ Completion error:", error.response?.data || error.message);
          // Return more detailed error information
          return res.status(500).json({ 
            message: "Payment completion failed",
            error: error.response?.data || error.message,
            status: error.response?.status
          });
        }

      default:
        return res.status(400).json({ message: `Invalid action: ${action}` });
    }
  } catch (error: any) {
    console.error('🔥 Payment operation error:', error.stack || error);
    return res.status(500).json({ 
      message: 'Payment operation failed',
      error: error.message
    });
  }
}