// @ts-nocheck
import { getStorage, jwtVerify } from "./_utils";

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
  transactions: [],
  users: {},
  packages: {}
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  
  const { method } = req;
  const store = mockStorage;

  try {
    if (method === "GET") {
      try {
        const token = getToken(req);
        const decoded = jwtVerify(token);
        
        // Get user's transactions
        const userTransactions = store.transactions.filter(txn => txn.userId === decoded.pi_id);
        
        return res.status(200).json({ transactions: userTransactions });
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
    
    if (method === "POST") {
      try {
        const token = getToken(req);
        const decoded = jwtVerify(token);
        const body = await readBody(req);
        
        if (body.action === "create") {
          const { packageId, gameAccount, piAmount, usdAmount, piPriceAtTime } = body.data;
          
          // Create a new transaction
          const newTransaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: decoded.pi_id,
            packageId,
            paymentId: '',
            txid: '',
            piAmount: piAmount.toString(),
            usdAmount: usdAmount.toString(),
            piPriceAtTime: piPriceAtTime.toString(),
            status: 'pending',
            gameAccount,
            emailSent: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          store.transactions.push(newTransaction);
          
          return res.status(200).json({ 
            message: "Transaction created", 
            transaction: newTransaction 
          });
        }
        
        return res.status(400).json({ message: "Invalid action" });
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