import { jwt } from "./_utils";
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
  const PI_SANDBOX = true;
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

        // Mock verification for Vercel environment
        // In a real implementation, you would verify with Pi Network API
        try {
          console.log("Mock verifying access token with Pi Network");
          
          // Mock user data
          const userData = {
            uid: 'mock-user-id-' + Date.now(),
            username: 'mock-user-' + Date.now(),
            wallet_address: 'GAX48COU5X52W5TWB45OJUVCXKW5F3XS5NMNQKI25R557XUU65WV4245'
          };

          console.log("Mock user data verified:", userData);

          // Create or update user in our mock storage
          const userId = userData.uid;
          if (!store.users[userId]) {
            store.users[userId] = {
              id: userId,
              username: userData.username,
              email: '',
              phone: '',
              country: 'Bhutan',
              language: 'en',
              walletAddress: userData.wallet_address || '',
              profileImage: '',
              gameAccounts: {},
              referralCode: ''
            };
          }

          // Update user data
          store.users[userId] = {
            ...store.users[userId],
            username: userData.username,
            walletAddress: userData.wallet_address || ''
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