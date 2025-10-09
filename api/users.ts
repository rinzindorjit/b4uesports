// @ts-nocheck

// Inline the necessary functions directly
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_b4u_key';
const PI_API_URL = 'https://api.minepi.com/v2';
const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY || 'test_pi_server_api_key_for_development';

function jwtVerify(token) {
  return jwt.verify(token, JWT_SECRET);
}

function jwtSign(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// In-memory store (replace with DB later)
const store = {
  users: {},
  transactions: [],
  packages: [
    // PUBG Packages
    { 
      id: 'pubg-1', 
      game: 'PUBG', 
      name: 'Small UC Pack', 
      inGameAmount: 100, 
      usdtValue: '10.00',
      image: '/images/pubg-small.jpg',
      isActive: true 
    },
    { 
      id: 'pubg-2', 
      game: 'PUBG', 
      name: 'Medium UC Pack', 
      inGameAmount: 250, 
      usdtValue: '25.00',
      image: '/images/pubg-medium.jpg',
      isActive: true 
    },
    { 
      id: 'pubg-3', 
      game: 'PUBG', 
      name: 'Large UC Pack', 
      inGameAmount: 500, 
      usdtValue: '50.00',
      image: '/images/pubg-large.jpg',
      isActive: true 
    },
    // MLBB Packages
    { 
      id: 'mlbb-1', 
      game: 'MLBB', 
      name: 'Small Diamond Pack', 
      inGameAmount: 50, 
      usdtValue: '10.00',
      image: '/images/mlbb-small.jpg',
      isActive: true 
    },
    { 
      id: 'mlbb-2', 
      game: 'MLBB', 
      name: 'Medium Diamond Pack', 
      inGameAmount: 125, 
      usdtValue: '25.00',
      image: '/images/mlbb-medium.jpg',
      isActive: true 
    },
    { 
      id: 'mlbb-3', 
      game: 'MLBB', 
      name: 'Large Diamond Pack', 
      inGameAmount: 250, 
      usdtValue: '50.00',
      image: '/images/mlbb-large.jpg',
      isActive: true 
    },
  ],
  payments: [],
};

function getStorage() {
  return store;
}

// Pi Network verification service
function getPiNetworkService() {
  return {
    verifyAccessToken: async (accessToken) => {
      if (!accessToken) throw new Error('Missing access token');
      
      try {
        const response = await fetch(`${PI_API_URL}/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          let errorMessage = 'Unknown error';
          try {
            const errorData = await response.json();
            errorMessage = (errorData && errorData['message']) || errorMessage;
          } catch (e) {
            // If we can't parse the error response, use the status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(`Pi Network API error: ${response.status} - ${errorMessage}`);
        }
        
        const userData = await response.json();
        
        return {
          username: userData['username'],
          pi_id: userData['uid'],
          email: userData['email'] || '',
        };
      } catch (error) {
        console.error('Pi Network verification failed:', error);
        throw new Error(`Failed to verify Pi Network access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  };
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { method } = req;
  
  if (method === "GET") {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwtVerify(token);
      const store = getStorage();
      const user = store.users[decoded.pi_id];
      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({ user });
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  if (method === "POST") {
    const body = await readBody(req);
    const { action, accessToken } = body;

    if (action === "login") {
      if (!accessToken) return res.status(400).json({ message: "Access token required" });

      try {
        const piService = getPiNetworkService();
        const piUser = await piService.verifyAccessToken(accessToken);
        
        const store = getStorage();
        if (!store.users[piUser.pi_id]) {
          store.users[piUser.pi_id] = {
            ...piUser,
            id: piUser.pi_id,
            createdAt: new Date().toISOString(),
          };
        }

        const token = jwtSign(piUser);
        return res.status(200).json({ token, user: piUser });
      } catch (err) {
        console.error("Authentication failed:", err);
        return res.status(500).json({ 
          message: `Failed to verify Pi Network access token: ${err.message || 'Unknown error'}` 
        });
      }
    }

    return res.status(400).json({ message: "Invalid action for /api/users" });
  }

  return res.status(405).json({ message: "Method not allowed" });
}

module.exports = handler;