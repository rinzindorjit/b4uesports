import type { VercelRequest, VercelResponse } from '@vercel/node';

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

// Utility function to ensure consistent JSON responses
function sendJsonResponse(res: VercelResponse, status: number, data: any) {
  // Ensure we always return JSON
  res.setHeader('Content-Type', 'application/json');
  res.status(status).json(data);
}

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
    return sendJsonResponse(res, 405, { message: "Method not allowed. Only POST requests are allowed." });
  }

  console.log('Pi Network mode: ' + (isSandbox ? 'SANDBOX (Testnet)' : 'PRODUCTION'));
  console.log('Pi Network endpoint: ' + PI_API_BASE_URL);

  try {
    // Parse request body
    const body: any = await readBody(req);
    const { action, data } = body as { action: string; data: any };
    
    // Validate action parameter
    if (!action) {
      return sendJsonResponse(res, 400, { message: "Missing action parameter" });
    }

    // Check if PI_SERVER_API_KEY is configured
    const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY;
    if (!PI_SERVER_API_KEY) {
      console.error('❌ PI_SERVER_API_KEY is not configured in environment variables');
      return sendJsonResponse(res, 500, { 
        message: 'Payment service not properly configured. Please contact administrator.',
        error: 'Missing PI_SERVER_API_KEY environment variable'
      });
    }

    console.log('PI_SERVER_API_KEY configured:', !!PI_SERVER_API_KEY);
    console.log('PI_SERVER_API_KEY length:', PI_SERVER_API_KEY.length);

    // Test API key validity first with minimal headers
    console.log('Testing API key validity...');
    const testResponse = await fetch(`${PI_API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Key ${PI_SERVER_API_KEY}`,
      }
    });
    
    console.log(`API key test response status:`, testResponse.status);
    console.log(`API key test response headers:`, Object.fromEntries(testResponse.headers.entries()));
    
    // Check if we got HTML content (which indicates an error)
    const testContentType = testResponse.headers.get('content-type') || '';
    console.log('API key test Content-Type:', testContentType);
    
    if (testContentType.includes('text/html')) {
      const errorText = await testResponse.text();
      console.error('❌ Received HTML response instead of JSON for API key test');
      console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
      return sendJsonResponse(res, 500, { 
        message: "API key test failed - received HTML error page from CloudFront",
        error: "CloudFront blocked the request - check API key and permissions",
        status: testResponse.status,
        details: errorText.substring(0, 1000),
        contentType: testContentType
      });
    }
    
    if (!testResponse.ok) {
      const testError = await testResponse.text();
      console.error('API key test failed:', testResponse.status, testError);
      return sendJsonResponse(res, 500, { 
        message: "API key test failed",
        error: testError,
        status: testResponse.status
      });
    }

    switch (action) {
      case 'approve':
        try {
          // Validate required data
          if (!data) {
            return sendJsonResponse(res, 400, { message: "Data is required" });
          }

          // Handle both paymentId and transaction_id
          const paymentId = data.paymentId || data.transaction_id;
          if (!paymentId) {
            return sendJsonResponse(res, 400, { message: "paymentId or transaction_id is required" });
          }

          console.log('Approving payment: ' + paymentId);

          // Log the request details for debugging
          console.log('Making server-to-server request to Pi Network API:');
          console.log('- URL:', `${PI_API_BASE_URL}/payments/${paymentId}/approve`);
          console.log('- Headers:', {
            'Authorization': `Key ${PI_SERVER_API_KEY.substring(0, 8)}...`, // Log first 8 chars for better security
          });

          // Make the approval request with minimal headers as per documentation
          const response = await fetch(
            `${PI_API_BASE_URL}/payments/${paymentId}/approve`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Key ${PI_SERVER_API_KEY}`,
              },
            }
          );
          
          console.log(`Pi Network API response status:`, response.status);
          console.log(`Pi Network API response headers:`, Object.fromEntries(response.headers.entries()));
          
          // Check if we got HTML content (which indicates an error)
          const contentType = response.headers.get('content-type') || '';
          console.log('Response Content-Type:', contentType);
          
          if (contentType.includes('text/html')) {
            const errorText = await response.text();
            console.error('❌ Received HTML response instead of JSON - likely a CloudFront error');
            console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
            return sendJsonResponse(res, 500, { 
              message: "Payment approval failed - received HTML error page from CloudFront",
              error: "CloudFront blocked the request - check API key and permissions",
              status: response.status,
              details: errorText.substring(0, 1000),
              contentType: contentType,
              // Add more debugging information
              debugInfo: {
                paymentId: paymentId,
                apiUrl: `${PI_API_BASE_URL}/payments/${paymentId}/approve`,
                requestMethod: 'POST',
                requestHeaders: {
                  'Authorization': `Key ${PI_SERVER_API_KEY.substring(0, 8)}...`,
                }
              }
            });
          }
          
          // Parse JSON response
          let responseData;
          try {
            responseData = await response.json();
          } catch (parseError) {
            const errorText = await response.text();
            console.error('❌ Failed to parse JSON response:', errorText);
            return sendJsonResponse(res, 500, { 
              message: "Payment approval failed - invalid response format",
              error: "Failed to parse response from Pi Network API",
              status: response.status,
              rawResponse: errorText.substring(0, 1000),
              contentType: contentType
            });
          }
          
          // Check for successful response
          if (response.ok) {
            console.log(`✅ Payment approved on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId);
            return sendJsonResponse(res, 200, {
              message: "Payment approved successfully",
              payment: responseData,
              status: "approved"
            });
          } else {
            console.error("❌ Approval error:", response.status, responseData);
            return sendJsonResponse(res, response.status, { 
              message: "Payment approval failed",
              error: responseData,
              status: response.status
            });
          }
        } catch (error: any) {
          console.error("❌ Approval error:", error.message);
          console.error("Error stack:", error.stack);
          return sendJsonResponse(res, 500, { 
            message: "Payment approval failed",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }

      case 'complete':
        try {
          // Validate required data
          if (!data) {
            return sendJsonResponse(res, 400, { 
              message: "Data is required for completion" 
            });
          }

          // Handle both paymentId and transaction_id
          const paymentId = data.paymentId || data.transaction_id;
          const txid = data.txid;
          
          if (!paymentId) {
            return sendJsonResponse(res, 400, { 
              message: "paymentId or transaction_id is required for completion" 
            });
          }
          
          if (!txid) {
            return sendJsonResponse(res, 400, { 
              message: "txid is required for completion" 
            });
          }

          console.log('Completing payment: ' + paymentId + ' with txid: ' + txid);

          // Log the request details for debugging
          console.log('Making server-to-server request to Pi Network API:');
          console.log('- URL:', `${PI_API_BASE_URL}/payments/${paymentId}/complete`);
          console.log('- Headers:', {
            'Authorization': `Key ${PI_SERVER_API_KEY.substring(0, 8)}...`, // Log first 8 chars for better security
          });
          console.log('- Body:', { txid });

          // Make the completion request with minimal headers as per documentation
          const response = await fetch(
            `${PI_API_BASE_URL}/payments/${paymentId}/complete`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Key ${PI_SERVER_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ txid }),
            }
          );
          
          console.log(`Pi Network API response status:`, response.status);
          console.log(`Pi Network API response headers:`, Object.fromEntries(response.headers.entries()));
          
          // Check if we got HTML content (which indicates an error)
          const contentType = response.headers.get('content-type') || '';
          console.log('Response Content-Type:', contentType);
          
          if (contentType.includes('text/html')) {
            const errorText = await response.text();
            console.error('❌ Received HTML response instead of JSON - likely a CloudFront error');
            console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
            return sendJsonResponse(res, 500, { 
              message: "Payment completion failed - received HTML error page from CloudFront",
              error: "CloudFront blocked the request - check API key and permissions",
              status: response.status,
              details: errorText.substring(0, 1000),
              contentType: contentType,
              // Add more debugging information
              debugInfo: {
                paymentId: paymentId,
                txid: txid,
                apiUrl: `${PI_API_BASE_URL}/payments/${paymentId}/complete`,
                requestMethod: 'POST',
                requestHeaders: {
                  'Authorization': `Key ${PI_SERVER_API_KEY.substring(0, 8)}...`,
                  'Content-Type': 'application/json',
                }
              }
            });
          }
          
          // Parse JSON response
          let responseData;
          try {
            responseData = await response.json();
          } catch (parseError) {
            const errorText = await response.text();
            console.error('❌ Failed to parse JSON response:', errorText);
            return sendJsonResponse(res, 500, { 
              message: "Payment completion failed - invalid response format",
              error: "Failed to parse response from Pi Network API",
              status: response.status,
              rawResponse: errorText.substring(0, 1000),
              contentType: contentType
            });
          }
          
          // Check for successful response
          if (response.ok) {
            console.log(`✅ Payment completed on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId, "TXID:", txid);
            return sendJsonResponse(res, 200, { 
              message: "Payment completed successfully",
              payment: responseData,
              status: "completed"
            });
          } else {
            console.error("❌ Completion error:", response.status, responseData);
            return sendJsonResponse(res, response.status, { 
              message: "Payment completion failed",
              error: responseData,
              status: response.status
            });
          }
        } catch (error: any) {
          console.error("❌ Completion error:", error.message);
          console.error("Error stack:", error.stack);
          return sendJsonResponse(res, 500, { 
            message: "Payment completion failed",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }

      default:
        return sendJsonResponse(res, 400, { message: `Invalid action: ${action}` });
    }
  } catch (error: any) {
    console.error('🔥 Payment operation error:', error.stack || error);
    return sendJsonResponse(res, 500, { 
      message: 'Payment operation failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}