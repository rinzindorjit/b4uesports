// @ts-nocheck
import fetch from 'node-fetch';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Debug logging for sandbox detection
console.log("🔍 DEBUG: process.env.PI_SANDBOX raw value:", process.env.PI_SANDBOX);

const PI_SANDBOX = String(process.env.PI_SANDBOX || "").toLowerCase() === "true";
console.log("🔍 DEBUG: PI_SANDBOX boolean value:", PI_SANDBOX);

const PI_SERVER_URL = PI_SANDBOX
  ? "https://sandbox.minepi.com/v2"
  : "https://api.minepi.com/v2";

console.log("🔍 DEBUG: PI_SERVER_URL:", PI_SERVER_URL);

// Utility functions for reading request body
async function readBody(req: VercelRequest) {
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

// Validate payment ID format (Pi payment IDs are typically alphanumeric with dashes)
function isValidPaymentId(paymentId: string) {
  return typeof paymentId === 'string' && /^[a-zA-Z0-9-]+$/.test(paymentId);
}

// Production-ready Pi Network payments handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers - restrict in production
  const allowedOrigin = process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.com' 
    : '*';
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
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

  // Security: Ensure PI_SERVER_API_KEY is provided via environment variables
  const PI_API_KEY = process.env.PI_SERVER_API_KEY || process.env.PI_API_KEY;
  if (!PI_API_KEY) {
    console.error("❌ Missing PI_API_KEY environment variable");
    return res.status(500).json({ 
      message: "Server configuration error: Missing PI_API_KEY" 
    });
  }

  // Robust sandbox mode detection
  const PI_SANDBOX = String(process.env.PI_SANDBOX || "").toLowerCase() === "true";
  const PI_SERVER_URL = PI_SANDBOX ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';
  
  console.log('Pi Network mode: ' + (PI_SANDBOX ? 'SANDBOX (Testnet)' : 'PRODUCTION'));
  console.log('Pi Network endpoint: ' + PI_SERVER_URL);

  try {
    // Parse request body
    const body = await readBody(req);
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
          
          // Validate payment ID format
          if (!isValidPaymentId(paymentId)) {
            return res.status(400).json({ message: "Invalid paymentId format" });
          }

          console.log('Approving payment: ' + paymentId);

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
            console.error(`❌ Pi Network approval failed for ${paymentId}:`, approvalData);
            return res.status(response.status).json({ 
              message: "Pi Network approval failed", 
              error: approvalData 
            });
          }
          
          console.log('Payment approved: ' + paymentId);
          return res.json({
            message: "Payment approved successfully",
            payment: approvalData,
            status: "approved"
          });
        } catch (error) {
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
          
          // Validate payment ID and transaction ID formats
          if (!isValidPaymentId(paymentId)) {
            return res.status(400).json({ message: "Invalid paymentId format" });
          }
          
          if (typeof txid !== 'string' || txid.length === 0) {
            return res.status(400).json({ message: "Invalid txid format" });
          }

          console.log('Completing payment: ' + paymentId + ' with txid: ' + txid);

          // For completion, we'll just return a success response
          // In a production environment, you would update your persistent database here
          console.log('Payment completed: ' + paymentId);
          return res.json({ 
            message: "Payment completed successfully",
            paymentId,
            txid,
            status: "completed"
          });
        } catch (error) {
          console.error("❌ Completion error:", error.stack || error);
          return res.status(500).json({ 
            message: "Payment completion failed",
            error: error.message 
          });
        }

      default:
        return res.status(400).json({ message: `Invalid action: ${action}` });
    }
  } catch (error) {
    console.error('🔥 Payment operation error:', error.stack || error);
    return res.status(500).json({ 
      message: 'Payment operation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}