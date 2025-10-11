import { jwt } from "./_utils";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

// Define the user data interface
interface PiUserData {
  uid: string;
  username: string;
  email?: string;
  phone?: string;
  country?: string;
  language?: string;
  wallet_address?: string;
  profile_image?: string;
}

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

function getToken(req: VercelRequest): string {
  const auth = req.headers["authorization"];
  if (!auth) throw new Error("Missing Authorization header");
  return auth.replace("Bearer ", "");
}

// Mock storage for Vercel environment
let mockStorage = {
  users: {} as Record<string, any>,
  transactions: [] as any[],
  packages: {} as Record<string, any>
};

// Vercel-compatible Pi Network users handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight requests for 24 hours
  
  // Handle preflight requests
  if (req.method === "OPTIONS") return res.status(200).end();
  
  const { method } = req;
  const store = mockStorage;
  
  // Use sandbox mode by default for Vercel environment
  const PI_SANDBOX = process.env.PI_SANDBOX === 'true' || process.env.NODE_ENV !== 'production';
  const PI_SERVER_URL = PI_SANDBOX ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';
  
  console.log('Pi Network mode: ' + (PI_SANDBOX ? 'SANDBOX (Testnet)' : 'PRODUCTION'));
  console.log('Pi Network endpoint: ' + PI_SERVER_URL);

  try {
    if (method === "POST") {
      const body: any = await readBody(req);

      if (body.action === "authenticate") {
        const { accessToken } = body.data;
        console.log("Attempting to verify access token:", accessToken ? "Token provided" : "No token");
        
        if (!accessToken) {
          return res.status(400).json({ message: "Missing access token" });
        }

        // Real verification with Pi Network API
        try {
          console.log("Verifying access token with Pi Network API");
          
          const response = await fetch(`${PI_SERVER_URL}/me`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            }
          });

          // Check if we got HTML content (which indicates an error)
          const contentType = response.headers.get('content-type') || '';
          console.log('Response Content-Type:', contentType);
          
          if (contentType.includes('text/html')) {
            const errorText = await response.text();
            console.error('❌ Received HTML response instead of JSON - likely a CloudFront error');
            console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
            return res.status(500).json({ 
              message: "Pi Network verification failed - received HTML error page",
              error: "CloudFront blocked the request",
              status: response.status,
              details: errorText.substring(0, 1000)
            });
          }

          const userData = await response.json() as PiUserData;
          if (!response.ok) {
            console.error("Pi Network verification failed:", response.status, userData);
            return res.status(response.status).json({ 
              message: "Pi Network verification failed",
              error: userData
            });
          }

          console.log("User data verified:", userData);

          // Create or update user in our mock storage
          const userId = userData.uid;
          if (!store.users[userId]) {
            store.users[userId] = {
              id: userId,
              username: userData.username,
              email: userData.email || '',
              phone: userData.phone || '',
              country: userData.country || 'Bhutan',
              language: userData.language || 'en',
              walletAddress: userData.wallet_address || '',
              profileImage: userData.profile_image || '',
              gameAccounts: {},
              referralCode: ''
            };
          }

          // Update user data
          store.users[userId] = {
            ...store.users[userId],
            username: userData.username,
            email: userData.email || '',
            phone: userData.phone || '',
            country: userData.country || 'Bhutan',
            language: userData.language || 'en',
            walletAddress: userData.wallet_address || '',
            profileImage: userData.profile_image || ''
          };

          const token = jwt.sign({ 
            pi_id: userId,
            username: userData.username
          }, process.env.JWT_SECRET || 'fallback-secret');
          
          console.log("JWT token generated for user:", userData.username);
          return res.status(200).json({ 
            message: "User authenticated", 
            user: store.users[userId], 
            token 
          });
        } catch (error: any) {
          console.error("Authentication error:", error.stack || error);
          return res.status(500).json({ 
            message: "Authentication verification failed", 
            error: error.message 
          });
        }
      }

      if (body.action === "getProfile") {
        try {
          const token = getToken(req);
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
          const user = store.users[decoded.pi_id];
          return res.status(200).json({ user });
        } catch (error: any) {
          return res.status(401).json({ message: "Invalid token" });
        }
      }

      return res.status(400).json({ message: "Invalid action for /api/users" });
    }

    if (method === "GET") {
      try {
        const token = getToken(req);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        const user = store.users[decoded.pi_id];
        return res.status(200).json({ user });
      } catch (error: any) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    return res.status(405).json({ message: "Method not allowed. Only POST and GET requests are allowed." });
  } catch (err: any) {
    console.error("API Error:", err.stack || err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
}