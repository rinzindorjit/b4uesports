import { VercelRequest, VercelResponse } from "@vercel/node";
import fetch from "node-fetch";

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
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Parse request body
    let body = {};
    if (req.body) {
      body = req.body;
    } else {
      // Fallback for parsing body manually
      body = await new Promise((resolve, reject) => {
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
    
    const { token } = body as { token: string };
    if (!token) {
      return res.status(400).json({ message: "Missing token" });
    }

    // Use sandbox mode by default for Vercel environment
    const PI_SANDBOX = process.env.PI_SANDBOX === 'true' || process.env.NODE_ENV !== 'production';
    const PI_SERVER_URL = PI_SANDBOX ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';
    
    // Check if PI_SERVER_API_KEY is configured
    const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY;
    if (!PI_SERVER_API_KEY) {
      console.error('❌ PI_SERVER_API_KEY is not configured in environment variables');
      return res.status(500).json({ 
        message: 'Server configuration error',
        error: 'Missing PI_SERVER_API_KEY environment variable',
        guidance: {
          fix: "Please configure PI_SERVER_API_KEY in your environment variables",
          docs: "See DEPLOYMENT_GUIDE.md for instructions"
        }
      });
    }
    
    console.log('Pi Network mode: ' + (PI_SANDBOX ? 'SANDBOX (Testnet)' : 'PRODUCTION'));
    console.log('Pi Network endpoint: ' + PI_SERVER_URL);
    console.log('Authorization header: Bearer ' + token.substring(0, 10) + '...');

    // Verify the access token using the server API key
    // This is the correct way to verify access tokens server-side according to Pi Network guidelines
    const response = await fetch(`${PI_SERVER_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken: token })
    });

    // Check if we got HTML content (which indicates an error)
    const contentType = response.headers.get('content-type') || '';
    console.log('Response Content-Type:', contentType);
    
    if (contentType.includes('text/html')) {
      const errorText = await response.text();
      console.error('❌ Received HTML response instead of JSON - likely a CloudFront error');
      console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
      
      // Provide more specific guidance based on the error
      let errorMessage = "Pi Network verification failed - received HTML error page from CloudFront";
      let errorDetails = "CloudFront blocked the request";
      
      // Check if this is a domain restriction error
      if (errorText.includes('soc') || errorText.includes('backendURL')) {
        errorMessage = "Domain restriction error - requests must come from Pi Browser or a registered domain";
        errorDetails = "You must access this application from the Pi Browser at the registered domain";
      }
      
      return res.status(500).json({ 
        message: errorMessage,
        error: errorDetails,
        status: response.status,
        details: errorText.substring(0, 1000),
        // Add helpful guidance for developers
        guidance: {
          domain: "Ensure you're accessing this application from a registered domain in the Pi Developer Portal",
          browser: "Make sure you're using the Pi Browser to access the application",
          deployment: "If running locally, deploy to a registered domain (e.g., Vercel)",
          api_key: "Verify that PI_SERVER_API_KEY is properly configured in your environment"
        }
      });
    }

    const data = await response.json();
    if (!response.ok) {
      console.error("Pi Network verification failed:", response.status, data);
      return res.status(response.status).json(data);
    }
    
    console.log("User data verified:", data);
    
    res.status(200).json(data);
  } catch (err: any) {
    console.error("Pi Auth Error:", err);
    res.status(500).json({ 
      message: "Backend verification failed", 
      error: err.message,
      // Add helpful guidance for developers
      guidance: {
        domain: "Ensure you're accessing this application from a registered domain in the Pi Developer Portal",
        browser: "Make sure you're using the Pi Browser to access the application",
        deployment: "If running locally, deploy to a registered domain (e.g., Vercel)",
        api_key: "Verify that PI_SERVER_API_KEY is properly configured in your environment"
      }
    });
  }
}