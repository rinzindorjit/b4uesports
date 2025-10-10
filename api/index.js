"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var index_exports = {};
__export(index_exports, {
  default: () => handler
});
module.exports = __toCommonJS(index_exports);
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_b4u_key";
const PI_API_URL = process.env.PI_SANDBOX === "true" ? "https://sandbox.minepi.com/v2" : "https://api.minepi.com/v2";
const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY || "test_pi_server_api_key_for_development";
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}
function getPiNetworkService() {
  return {
    verifyAccessToken: async (accessToken) => {
      if (!accessToken) throw new Error("Missing access token");
      try {
        const response = await fetch(`${PI_API_URL}/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          let errorMessage = "Unknown error";
          try {
            const errorData = await response.json();
            errorMessage = errorData && errorData["message"] || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(`Pi Network API error: ${response.status} - ${errorMessage}`);
        }
        const userData = await response.json();
        return {
          username: userData["username"],
          pi_id: userData["uid"],
          email: userData["email"] || ""
        };
      } catch (error) {
        console.error("Pi Network verification failed:", error);
        throw new Error(`Failed to verify Pi Network access token: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  };
}
const store = {
  users: {},
  transactions: [],
  packages: [
    // PUBG Packages
    {
      id: "pubg-1",
      game: "PUBG",
      name: "Small UC Pack",
      inGameAmount: 100,
      usdtValue: "10.00",
      image: "/images/pubg-small.jpg",
      isActive: true
    },
    {
      id: "pubg-2",
      game: "PUBG",
      name: "Medium UC Pack",
      inGameAmount: 250,
      usdtValue: "25.00",
      image: "/images/pubg-medium.jpg",
      isActive: true
    },
    {
      id: "pubg-3",
      game: "PUBG",
      name: "Large UC Pack",
      inGameAmount: 500,
      usdtValue: "50.00",
      image: "/images/pubg-large.jpg",
      isActive: true
    },
    // MLBB Packages
    {
      id: "mlbb-1",
      game: "MLBB",
      name: "Small Diamond Pack",
      inGameAmount: 50,
      usdtValue: "10.00",
      image: "/images/mlbb-small.jpg",
      isActive: true
    },
    {
      id: "mlbb-2",
      game: "MLBB",
      name: "Medium Diamond Pack",
      inGameAmount: 125,
      usdtValue: "25.00",
      image: "/images/mlbb-medium.jpg",
      isActive: true
    },
    {
      id: "mlbb-3",
      game: "MLBB",
      name: "Large Diamond Pack",
      inGameAmount: 250,
      usdtValue: "50.00",
      image: "/images/mlbb-large.jpg",
      isActive: true
    }
  ],
  payments: []
};
function getStorage() {
  return store;
}
function jwtVerify(token) {
  return jwt.verify(token, JWT_SECRET);
}
function jwtSign(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
async function handler(req, res) {
  const { url, method } = req;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (method === "OPTIONS") return res.status(200).end();
  try {
    if (url.includes("/users")) {
      if (method === "POST") {
        const body = await readBody(req);
        const { action, data } = body;
        if (action === "authenticate") {
          const { accessToken } = data;
          if (!accessToken) {
            return res.status(400).json({ message: "Access token required" });
          }
          try {
            const piService = getPiNetworkService();
            const piUser = await piService.verifyAccessToken(accessToken);
            const store2 = getStorage();
            if (!store2.users[piUser.pi_id]) {
              store2.users[piUser.pi_id] = {
                ...piUser,
                id: piUser.pi_id,
                createdAt: (/* @__PURE__ */ new Date()).toISOString()
              };
            }
            const token = jwtSign({ userId: piUser.pi_id, piUID: piUser.pi_id });
            return res.status(200).json({
              user: {
                id: piUser.pi_id,
                username: piUser.username,
                email: piUser.email
              },
              token
            });
          } catch (err) {
            console.error("Authentication failed:", err);
            return res.status(500).json({
              message: `Failed to verify Pi Network access token: ${err.message || "Unknown error"}`
            });
          }
        }
        
        // Handle updateProfile action
        if (action === "updateProfile") {
          const token = req.headers.authorization?.split(" ")[1];
          if (!token) return res.status(401).json({ message: "No token provided" });

          try {
            const decoded = jwtVerify(token);
            const userId = decoded.userId || decoded.pi_id;
            
            const updateData = data;
            
            // Validate required fields
            if (!updateData.email || !updateData.phone || !updateData.country) {
              return res.status(400).json({ message: 'Email, phone, and country are required' });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updateData.email)) {
              return res.status(400).json({ message: 'Invalid email format' });
            }

            // Validate phone format (allow only numbers and common separators)
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(updateData.phone)) {
              return res.status(400).json({ message: 'Invalid phone number format' });
            }

            // Validate game accounts if provided
            if (updateData.gameAccounts) {
              if (updateData.gameAccounts.pubg) {
                if (!updateData.gameAccounts.pubg.ign || !updateData.gameAccounts.pubg.uid) {
                  return res.status(400).json({ message: 'PUBG IGN and UID are required' });
                }
                // Validate UID is numeric
                if (!/^\d+$/.test(updateData.gameAccounts.pubg.uid)) {
                  return res.status(400).json({ message: 'PUBG UID must be numeric' });
                }
              }
              
              if (updateData.gameAccounts.mlbb) {
                if (!updateData.gameAccounts.mlbb.userId || !updateData.gameAccounts.mlbb.zoneId) {
                  return res.status(400).json({ message: 'MLBB User ID and Zone ID are required' });
                }
                // Validate IDs are numeric
                if (!/^\d+$/.test(updateData.gameAccounts.mlbb.userId) || !/^\d+$/.test(updateData.gameAccounts.mlbb.zoneId)) {
                  return res.status(400).json({ message: 'MLBB User ID and Zone ID must be numeric' });
                }
              }
            }
            
            // Find user and update data
            const user = store2.users[userId];
            if (!user) return res.status(404).json({ message: "User not found" });
            
            // Update user data
            store2.users[userId] = { 
              ...user, 
              ...updateData,
              email: updateData.email,
              phone: updateData.phone,
              country: updateData.country,
              language: updateData.language || user.language,
              gameAccounts: updateData.gameAccounts || user.gameAccounts
            };
            
            return res.status(200).json(store2.users[userId]);
          } catch (err) {
            console.error("Profile update error:", err);
            return res.status(401).json({ message: "Invalid token" });
          }
        }
        
        return res.status(400).json({ message: "Invalid action for /api/users" });
      }
      if (method === "GET") {
        const { action } = req.query || {};
        const token = req.headers.authorization?.split(" ")[1];
        if (action === "me") {
          if (!token) return res.status(401).json({ message: "No token provided" });
          try {
            const decoded = jwtVerify(token);
            const store2 = getStorage();
            const userId = decoded.userId || decoded.pi_id;
            const user = store2.users[userId];
            if (!user) return res.status(404).json({ message: "User not found" });
            return res.status(200).json({
              id: user.id,
              username: user.username,
              email: user.email
            });
          } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ message: "Invalid token" });
          }
        }
        return res.status(400).json({ message: "Invalid action for /api/users" });
      }
      return res.status(405).json({ message: "Method not allowed for /api/users" });
    }
    if (url.includes("/transactions")) {
      if (method === "GET") {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token provided" });
        try {
          const decoded = jwtVerify(token);
          const store2 = getStorage();
          const userId = decoded.userId || decoded.pi_id;
          const userTransactions = store2.transactions.filter((txn) => txn.user === userId);
          return res.status(200).json({ transactions: userTransactions });
        } catch (err) {
          console.error("Transaction retrieval error:", err);
          return res.status(500).json({
            message: `Failed to retrieve transactions: ${err.message || "Unknown error"}`
          });
        }
      }
      if (method === "POST") {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token provided" });
        try {
          const decoded = jwtVerify(token);
          const body = await readBody(req);
          const userId = decoded.userId || decoded.pi_id;
          const txn = {
            id: `txn_${Date.now()}`,
            user: userId,
            amount: body.amount,
            date: /* @__PURE__ */ new Date()
          };
          const store2 = getStorage();
          store2.transactions.push(txn);
          return res.status(200).json({ message: "Transaction added", txn });
        } catch (err) {
          console.error("Transaction error:", err);
          return res.status(500).json({
            message: `Transaction failed: ${err.message || "Unknown error"}`
          });
        }
      }
      return res.status(405).json({ message: "Method not allowed for /api/transactions" });
    }
    if (url.includes("/health")) {
      if (method === "GET") {
        return res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
      }
      return res.status(405).json({ message: "Only GET allowed for /api/health" });
    }
    return res.status(200).json({
      message: "B4U Esports Unified API Online",
      endpoints: [
        "/api/users",
        "/api/transactions",
        "/api/pi-price",
        "/api/health"
      ]
    });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
}
