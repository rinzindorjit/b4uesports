// @ts-nocheck
import { getStorage, jwtVerify } from "./_utils";
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
  transactions: [],
  users: {},
  packages: {}
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // For Vercel deployment, we'll use mock data
  const store = mockStorage;
  
  const PI_API_KEY = process.env.PI_API_KEY || 'cszew9tw3qa1re4visdjd72jt38qy475fugolvqxikfr6xdclngdshajvmunurc9';
  const PI_SANDBOX = process.env.PI_SANDBOX === 'true';
  const PI_SERVER_URL = PI_SANDBOX ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';

  try {
    if (req.method === "POST") {
      const body = await readBody(req);
      const { action, data } = body;
      
      switch (action) {
        case 'approve':
          try {
            const { paymentId } = data;
            if (!paymentId) {
              return res.status(400).json({ error: "paymentId is required" });
            }

            // Call the Pi Network API for approval
            const response = await fetch(`${PI_SERVER_URL}/payments/${paymentId}/approve`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Key ${PI_API_KEY}`
              },
              body: JSON.stringify({})
            });

            const approvalData = await response.json();
            
            if (!response.ok) {
              console.error("Pi Network approval failed:", approvalData);
              return res.status(response.status).json({ 
                error: "Pi Network approval failed", 
                details: approvalData 
              });
            }
            
            console.log('Payment approved:', approvalData);
            return res.json(approvalData);
          } catch (error) {
            console.error("Approval error:", error);
            return res.status(500).json({ error: "Approval failed", details: error.message });
          }

        case 'complete':
          // Server-Side Completion as required by Pi Network
          const paymentToComplete = store.transactions.find(txn => txn.paymentId === data.paymentId);
          if (!paymentToComplete) {
            return res.status(404).json({ message: 'Payment not found' });
          }
          
          // Update payment status in our database
          paymentToComplete.status = 'completed';
          paymentToComplete.txid = data.txid;
          
          return res.json({ message: 'Payment completed', result: paymentToComplete });

        default:
          return res.status(400).json({ message: 'Invalid action' });
      }
    }
    
    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error('Payment operation error:', error);
    return res.status(500).json({ message: 'Payment operation failed' });
  }
}