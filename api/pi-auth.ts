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
    const PI_SANDBOX = true;
    const PI_SERVER_URL = PI_SANDBOX ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';
    
    console.log('Pi Network mode: ' + (PI_SANDBOX ? 'SANDBOX (Testnet)' : 'PRODUCTION'));
    console.log('Pi Network endpoint: ' + PI_SERVER_URL);
    console.log("Authorization header:", `Bearer ${token.substring(0, 10)}...`);

    // For Vercel environment, we'll use a mock verification
    // In a real implementation with proper environment variables, you would use:
    /*
    const response = await fetch(`${PI_SERVER_URL}/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Pi Network verification failed:", response.status, data);
      return res.status(response.status).json(data);
    }
    */

    // Mock verification for Vercel environment
    const mockData = {
      uid: 'mock-user-id-' + Date.now(),
      username: 'mock-user-' + Date.now(),
      wallet_address: 'GAX48COU5X52W5TWB45OJUVCXKW5F3XS5NMNQKI25R557XUU65WV4245'
    };
    
    console.log("Mock user data verified:", mockData);
    
    res.status(200).json(mockData);
  } catch (err: any) {
    console.error("Pi Auth Error:", err);
    res.status(500).json({ 
      message: "Backend verification failed", 
      error: err.message 
    });
  }
}