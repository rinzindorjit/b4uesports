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

    // Default response for root API endpoint
    return res.status(200).json({
      message: "B4U Esports Unified API Online",
      endpoints: [
        "/api/pi-price",
        "/api/health"
      ]
    });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
}
