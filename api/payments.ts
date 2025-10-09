// @ts-nocheck

// Inline the necessary functions directly
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_b4u_key';

function jwtVerify(token) {
  return jwt.verify(token, JWT_SECRET);
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
  
  if (method === "POST") {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
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
    } catch (err) {
      console.error("Payment error:", err);
      return res.status(500).json({ 
        message: `Payment failed: ${err.message || 'Unknown error'}` 
      });
    }
  }

  if (method === "GET") {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwtVerify(token);
      const store = getStorage();
      const userPayments = store.payments.filter((p) => p.user === decoded.pi_id);
      return res.status(200).json({ payments: userPayments });
    } catch (err) {
      console.error("Payment retrieval error:", err);
      return res.status(500).json({ 
        message: `Failed to retrieve payments: ${err.message || 'Unknown error'}` 
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

module.exports = handler;