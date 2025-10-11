import { jwt } from "./_utils";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

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

// Mock package data for Vercel environment (since we can't access the database)
const mockPackages = {
  "pubg-60": { id: "pubg-60", name: "60 UC", game: "PUBG", usdtValue: "1.5000" },
  "pubg-325": { id: "pubg-325", name: "325 UC", game: "PUBG", usdtValue: "6.5000" },
  "pubg-660": { id: "pubg-660", name: "660 UC", game: "PUBG", usdtValue: "12.0000" },
  "pubg-1800": { id: "pubg-1800", name: "1800 UC", game: "PUBG", usdtValue: "25.0000" },
  "pubg-3850": { id: "pubg-3850", name: "3850 UC", game: "PUBG", usdtValue: "49.0000" },
  "pubg-8100": { id: "pubg-8100", name: "8100 UC", game: "PUBG", usdtValue: "96.0000" },
  "pubg-16200": { id: "pubg-16200", name: "16200 UC", game: "PUBG", usdtValue: "186.0000" },
  "pubg-24300": { id: "pubg-24300", name: "24300 UC", game: "PUBG", usdtValue: "278.0000" },
  "pubg-32400": { id: "pubg-32400", name: "32400 UC", game: "PUBG", usdtValue: "369.0000" },
  "pubg-40500": { id: "pubg-40500", name: "40500 UC", game: "PUBG", usdtValue: "459.0000" },
  "mlbb-56": { id: "mlbb-56", name: "56 Diamonds", game: "MLBB", usdtValue: "3.0000" },
  "mlbb-278": { id: "mlbb-278", name: "278 Diamonds", game: "MLBB", usdtValue: "6.0000" },
  "mlbb-571": { id: "mlbb-571", name: "571 Diamonds", game: "MLBB", usdtValue: "11.0000" },
  "mlbb-1783": { id: "mlbb-1783", name: "1783 Diamonds", game: "MLBB", usdtValue: "33.0000" },
  "mlbb-3005": { id: "mlbb-3005", name: "3005 Diamonds", game: "MLBB", usdtValue: "52.0000" },
  "mlbb-6012": { id: "mlbb-6012", name: "6012 Diamonds", game: "MLBB", usdtValue: "99.0000" },
  "mlbb-12000": { id: "mlbb-12000", name: "12000 Diamonds", game: "MLBB", usdtValue: "200.0000" }
};

// In-memory storage for transactions in Vercel environment
let transactions: any[] = [];

// Vercel-compatible transactions handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight requests for 24 hours
  
  // Handle preflight requests
  if (req.method === "OPTIONS") return res.status(200).end();
  
  const { method } = req;

  try {
    if (method === "GET") {
      try {
        const token = getToken(req);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        
        // Get user's transactions
        const userTransactions = transactions.filter(txn => txn.userId === decoded.pi_id);
        
        return res.status(200).json({ transactions: userTransactions });
      } catch (error: any) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
    
    if (method === "POST") {
      try {
        const token = getToken(req);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        const body: any = await readBody(req);
        
        if (body.action === "create") {
          const { packageId, gameAccount, piAmount, usdAmount, piPriceAtTime } = body.data;
          
          // Validate required fields
          if (!packageId || !piAmount || !usdAmount || !piPriceAtTime) {
            return res.status(400).json({ message: "Missing required fields" });
          }
          
          // Validate package exists
          const packageDetails = mockPackages[packageId as keyof typeof mockPackages];
          if (!packageDetails) {
            return res.status(400).json({ message: "Invalid package ID" });
          }
          
          // Create a new transaction
          const newTransaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: decoded.pi_id,
            packageId,
            packageName: packageDetails.name,
            paymentId: '',
            txid: '',
            piAmount: piAmount.toString(),
            usdAmount: usdAmount.toString(),
            piPriceAtTime: piPriceAtTime.toString(),
            status: 'pending',
            gameAccount: gameAccount || {},
            emailSent: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          transactions.push(newTransaction);
          
          return res.status(200).json({ 
            message: "Transaction created", 
            transaction: newTransaction 
          });
        }
        
        return res.status(400).json({ message: "Invalid action" });
      } catch (error: any) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }

    return res.status(405).json({ message: "Method not allowed. Only GET and POST requests are allowed." });
  } catch (err: any) {
    console.error("API Error:", err.stack || err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
}