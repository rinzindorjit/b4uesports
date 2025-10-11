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
  transactions: [] as any[],
  users: {} as Record<string, any>,
  packages: {} as Record<string, any>
};

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
  const store = mockStorage;

  try {
    if (method === "GET") {
      try {
        const token = getToken(req);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        
        // Get user's transactions
        const userTransactions = store.transactions.filter(txn => txn.userId === decoded.pi_id);
        
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
            gameAccount: gameAccount || {},
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