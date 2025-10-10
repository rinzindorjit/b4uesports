// @ts-nocheck
import { getStorage, jwtSign, jwtVerify } from "./_utils";
import fetch from 'node-fetch';

async function readBody(req) {
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

function getToken(req) {
  const auth = req.headers["authorization"];
  if (!auth) throw new Error("Missing Authorization header");
  return auth.replace("Bearer ", "");
}

// Mock storage for Vercel environment
let mockStorage = {
  users: {},
  transactions: [],
  packages: {}
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  
  const { method } = req;
  const store = mockStorage;
  
  // Pi Network configuration
  const PI_API_KEY = process.env.PI_API_KEY || 'cszew9tw3qa1re4visdjd72jt38qy475fugolvqxikfr6xdclngdshajvmunurc9';
  const PI_SANDBOX = process.env.PI_SANDBOX === 'true';
  const PI_SERVER_URL = PI_SANDBOX ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';

  try {
    if (method === "POST") {
      const body = await readBody(req);

      if (body.action === "authenticate") {
        const { accessToken } = body.data;
        console.log("Attempting to verify access token:", accessToken ? "Token provided" : "No token");
        
        if (!accessToken) {
          return res.status(400).json({ message: "Missing access token" });
        }

        // Verify the access token with Pi Network
        try {
          const response = await fetch(`${PI_SERVER_URL}/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Pi Network verification failed:", errorData);
            throw new Error(`Pi Network verification failed: ${response.status} ${response.statusText}`);
          }

          const userData = await response.json();
          console.log("User data verified:", userData);

          // Create or update user in our mock storage
          const userId = userData.uid;
          if (!store.users[userId]) {
            store.users[userId] = {
              id: userId,
              username: userData.username,
              email: '',
              phone: '',
              country: '',
              language: '',
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

          const token = jwtSign({ 
            pi_id: userId,
            username: userData.username
          });
          
          console.log("JWT token generated");
          return res.status(200).json({ 
            message: "User authenticated", 
            user: store.users[userId], 
            token 
          });
        } catch (error) {
          console.error("Authentication error:", error);
          return res.status(401).json({ 
            message: "Invalid Pi Network token", 
            error: error.message 
          });
        }
      }

      if (body.action === "getProfile") {
        try {
          const token = getToken(req);
          const decoded = jwtVerify(token);
          const user = store.users[decoded.pi_id];
          return res.status(200).json({ user });
        } catch (error) {
          return res.status(401).json({ message: "Invalid token" });
        }
      }

      return res.status(400).json({ message: "Invalid action for /api/users" });
    }

    if (method === "GET") {
      try {
        const token = getToken(req);
        const decoded = jwtVerify(token);
        const user = store.users[decoded.pi_id];
        return res.status(200).json({ user });
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({
      message: err.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? {
        message: err.message,
        stack: err.stack,
        name: err.name
      } : undefined
    });
  }
}