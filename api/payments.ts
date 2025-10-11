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

// Mock storage for Vercel environment
let mockStorage = {
  users: {} as Record<string, any>,
  transactions: [] as any[],
  packages: {} as Record<string, any>
};

// Vercel-compatible Pi Network payments handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight requests for 24 hours

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed. Only POST requests are allowed." });
  }

  // Use sandbox mode by default for Vercel environment
  const PI_SANDBOX = true;
  const PI_SERVER_URL = PI_SANDBOX ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';
  
  console.log('Pi Network mode: ' + (PI_SANDBOX ? 'SANDBOX (Testnet)' : 'PRODUCTION'));
  console.log('Pi Network endpoint: ' + PI_SERVER_URL);

  try {
    // Parse request body
    const body: any = await readBody(req);
    const { action, data } = body as { action: string; data: any };
    
    // Validate action parameter
    if (!action) {
      return res.status(400).json({ message: "Missing action parameter" });
    }

    switch (action) {
      case 'approve':
        try {
          // Validate required data
          if (!data || !data.paymentId) {
            return res.status(400).json({ message: "paymentId is required" });
          }

          const { paymentId } = data;
          
          console.log('Mock approving payment: ' + paymentId);

          // Mock approval - in a real implementation, you would call the Pi Network API
          const approvalData = {
            paymentId,
            status: 'approved',
            timestamp: new Date().toISOString()
          };
          
          console.log('Payment approved: ' + paymentId);
          return res.json({
            message: "Payment approved successfully",
            payment: approvalData,
            status: "approved"
          });
        } catch (error: any) {
          console.error("❌ Approval error:", error.stack || error);
          return res.status(500).json({ 
            message: "Payment approval failed",
            error: error.message 
          });
        }

      case 'complete':
        try {
          // Validate required data
          if (!data || !data.paymentId || !data.txid) {
            return res.status(400).json({ 
              message: "paymentId and txid are required for completion" 
            });
          }

          const { paymentId, txid } = data;
          
          console.log('Mock completing payment: ' + paymentId + ' with txid: ' + txid);

          // Mock completion - in a real implementation, you would call the Pi Network API
          const completionData = {
            paymentId,
            txid,
            status: 'completed',
            timestamp: new Date().toISOString()
          };
          
          console.log('Payment completed: ' + paymentId);
          return res.json({ 
            message: "Payment completed successfully",
            payment: completionData,
            status: "completed"
          });
        } catch (error: any) {
          console.error("❌ Completion error:", error.stack || error);
          return res.status(500).json({ 
            message: "Payment completion failed",
            error: error.message 
          });
        }

      default:
        return res.status(400).json({ message: `Invalid action: ${action}` });
    }
  } catch (error: any) {
    console.error('🔥 Payment operation error:', error.stack || error);
    return res.status(500).json({ 
      message: 'Payment operation failed',
      error: error.message
    });
  }
}