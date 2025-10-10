// @ts-nocheck

// Inline the necessary functions directly
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_b4u_key';
const PI_API_URL = 'https://api.minepi.com/v2';
const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY || 'test_pi_server_api_key_for_development';

// Add the readBody function here
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

// Updated store with all packages
const store = {
  users: {},
  transactions: [],
  packages: [
    // PUBG Packages - removed specified packages
    { 
      id: 'pubg-4', 
      game: 'PUBG', 
      name: '1800 UC Pack', 
      inGameAmount: 1800, 
      usdtValue: '25.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    { 
      id: 'pubg-5', 
      game: 'PUBG', 
      name: '3850 UC Pack', 
      inGameAmount: 3850, 
      usdtValue: '49.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    { 
      id: 'pubg-6', 
      game: 'PUBG', 
      name: '8100 UC Pack', 
      inGameAmount: 8100, 
      usdtValue: '96.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    { 
      id: 'pubg-7', 
      game: 'PUBG', 
      name: '16200 UC Pack', 
      inGameAmount: 16200, 
      usdtValue: '186.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    { 
      id: 'pubg-8', 
      game: 'PUBG', 
      name: '24300 UC Pack', 
      inGameAmount: 24300, 
      usdtValue: '278.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    // MLBB Packages - removed specified packages
    { 
      id: 'mlbb-3', 
      game: 'MLBB', 
      name: '571 Diamonds Pack', 
      inGameAmount: 571, 
      usdtValue: '11.0000',
      image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png',
      isActive: true 
    },
    { 
      id: 'mlbb-4', 
      game: 'MLBB', 
      name: '1783 Diamonds Pack', 
      inGameAmount: 1783, 
      usdtValue: '33.0000',
      image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png',
      isActive: true 
    },
    { 
      id: 'mlbb-5', 
      game: 'MLBB', 
      name: '3005 Diamonds Pack', 
      inGameAmount: 3005, 
      usdtValue: '52.0000',
      image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png',
      isActive: true 
    },
    { 
      id: 'mlbb-6', 
      game: 'MLBB', 
      name: '6012 Diamonds Pack', 
      inGameAmount: 6012, 
      usdtValue: '99.0000',
      image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png',
      isActive: true 
    },
    { 
      id: 'mlbb-7', 
      game: 'MLBB', 
      name: '12000 Diamonds Pack', 
      inGameAmount: 12000, 
      usdtValue: '200.0000',
      image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png',
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

function jwtSign(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function jwtVerify(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Helper function to calculate Pi amount from USD value
function calculatePiAmount(usdValue, piPrice) {
  if (!usdValue || !piPrice) return null;
  return usdValue / piPrice;
}

export default async function handler(req, res) {
  const { url, method } = req;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (method === "OPTIONS") return res.status(200).end();

  try {
    // ========= /api/pi-price =========
    if (url.includes("/pi-price")) {
      if (method === "GET") {
        try {
          // Use CoinGecko API to get the current Pi price with demo key
          const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4');
          const data = await response.json();
          const price = data['pi-network']?.usd;
          
          if (typeof price !== 'number') {
            throw new Error('Invalid price data received from CoinGecko');
          }
          
          return res.status(200).json({ 
            price: price, 
            lastUpdated: new Date().toISOString() 
          });
        } catch (error) {
          console.error('Failed to fetch Pi price from CoinGecko:', error);
          // Fallback to fixed price if API fails
          const fixedPrice = 0.24069;
          return res.status(200).json({ 
            price: fixedPrice, 
            lastUpdated: new Date().toISOString() 
          });
        }
      }
      return res.status(405).json({ message: "Only GET allowed for /api/pi-price" });
    }

    // ========= /api/health =========
    if (url.includes("/health")) {
      if (method === "GET") {
        return res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
      }
      return res.status(405).json({ message: "Only GET allowed for /api/health" });
    }

    // ========= /api/users =========
    if (url.includes("/users")) {
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
            // Verify with Pi Network
            const piResponse = await fetch("https://api.minepi.com/v2/me", {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            });

            if (!piResponse.ok) {
              let errorMessage = "Unknown error";
              try {
                const errorData = await piResponse.json();
                errorMessage = (errorData && errorData['message']) || errorMessage;
              } catch (e) {
                errorMessage = piResponse.statusText || errorMessage;
              }
              throw new Error(`Pi Network API error: ${piResponse.status} - ${errorMessage}`);
            }

            const userData = await piResponse.json();
            const piUser = {
              username: userData['username'],
              pi_id: userData['uid'],
              email: userData['email'] || '',
            };

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

    // ========= /api/packages =========
    if (url.includes("/packages")) {
      if (method === "GET") {
        const store = getStorage();
        
        // Get current Pi price
        let piPrice = 0.24069; // Default fallback price
        try {
          const piPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4');
          const piPriceData = await piPriceResponse.json();
          piPrice = piPriceData['pi-network']?.usd || piPrice;
        } catch (error) {
          console.error('Failed to fetch Pi price for packages:', error);
        }
        
        // Add Pi pricing information to packages
        const packagesWithPricing = store.packages.map(pkg => ({
          ...pkg,
          piPrice: calculatePiAmount(parseFloat(pkg.usdtValue), piPrice),
          currentPiPrice: piPrice
        }));
        
        return res.status(200).json(packagesWithPricing);
      }
      return res.status(405).json({ message: "Only GET allowed for /api/packages" });
    }

    // ========= /api/payments =========
    if (url.includes("/payments")) {
      if (method === "POST") {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwtVerify(token);
        const body = await readBody(req);

        const payment = {
          id: `pay_${Date.now()}`,
          user: decoded.pi_id,
          amount: body.amount,
          method: "Pi",
          date: new Date(),
        };
        const store = getStorage();
        store.payments.push(payment);
        return res.status(200).json({ message: "Payment recorded", payment });
      }

      if (method === "GET") {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwtVerify(token);
        const store = getStorage();
        const userPayments = store.payments.filter((p) => p.user === decoded.pi_id);
        return res.status(200).json({ payments: userPayments });
      }
    }

    // ========= /api/transactions =========
    if (url.includes("/transactions")) {
      if (method === "POST") {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwtVerify(token);
        const body = await readBody(req);

        const txn = {
          id: `txn_${Date.now()}`,
          user: decoded.pi_id,
          amount: body.amount,
          date: new Date(),
        };
        const store = getStorage();
        store.transactions.push(txn);
        return res.status(200).json({ message: "Transaction added", txn });
      }

      if (method === "GET") {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = jwtVerify(token);
        const store = getStorage();
        const userTxns = store.transactions.filter((t) => t.user === decoded.pi_id);
        return res.status(200).json({ transactions: userTxns });
      }
    }

    // ========= /api/data =========
    if (url.includes("/data")) {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token provided" });

      try {
        const decoded = jwtVerify(token);
        return res.status(200).json({ message: "Secure data accessed", timestamp: new Date() });
      } catch (err) {
        console.error("Token verification failed:", err);
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    // Default response for root API endpoint
    return res.status(200).json({
      message: "B4U Esports Unified API Online",
      endpoints: [
        "/api/pi-price",
        "/api/users",
        "/api/packages",
        "/api/payments",
        "/api/transactions",
        "/api/health",
        "/api/data"
      ]
    });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
}