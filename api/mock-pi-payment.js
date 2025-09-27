// /api/mock-pi-payment.js
// Version: 1.0.5 - Fix Pi Browser detection and CORS

import { db } from './utils/db.js';
import { storeMockPayment } from './utils/db-operations.js';

export default async function handler(req, res) {
  // Set CORS headers for Pi Browser compatibility
  // Allow both Pi sandbox and deployed domain
  const allowedOrigins = [
    "https://sandbox.minepi.com",
    "https://b4uesports.vercel.app"
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Check if request is from Pi Browser by looking at the x-requested-with header
  const isPiBrowser = req.headers['x-requested-with'] === 'pi.browser';
  console.log('Pi Browser detection - x-requested-with header:', req.headers['x-requested-with']);
  console.log('Is Pi Browser request:', isPiBrowser);

  const { paymentId } = req.body;
  if (!paymentId) {
    return res.status(400).json({ 
      error: "Invalid request", 
      message: "Payment ID is required" 
    });
  }

  // For Pi Testnet, we don't need to call the Pi Network API
  // Mock payments are handled entirely on the client-side
  console.log("🔄 Handling mock payment in Testnet mode...");
  console.log("💳 Payment ID:", paymentId);

  // Check if this is a mock payment ID (handle both mock_ and mock- prefixes)
  if (paymentId.startsWith('mock_') || paymentId.startsWith('mock-')) {
    console.log('✅ Mock payment ID detected in mock-pi-payment handler');
    
    // Generate a transaction ID once to avoid duplication
    const txid = "mock-tx-" + Date.now();
    
    // Store mock payment in database if available
    try {
      console.log('💾 Storing mock payment in database...');
      
      // Store the mock payment using our database operations
      const paymentData = {
        piAmount: '100.00000000', // Mock amount
        usdAmount: '10.0000', // Mock amount
        piPriceAtTime: '0.1000', // Mock price
        status: 'completed',
        gameAccount: {}, // Empty game account for mock
        metadata: {
          isMock: true,
          timestamp: new Date().toISOString()
        }
      };
      
      await storeMockPayment(paymentId, txid, paymentData);
      
      console.log('✅ Mock payment processed successfully');
    } catch (dbError) {
      console.error('❌ Database operation error:', dbError.message);
      // Continue with the response even if database operation fails
    }
    
    // For mock payments, return Pi Browser expected format
    return res.status(200).json({
      paymentId: paymentId,
      status: "success",
      transaction: {
        txid: txid,
        verified: true
      }
    });
  } else {
    console.log('⚠️ Non-mock payment ID detected in Testnet mode');
    
    // Generate a transaction ID once to avoid duplication
    const txid = "testnet-tx-" + Date.now();
    
    // Store real payment in database if available
    try {
      console.log('💾 Storing real payment in database...');
      
      // Store the payment using our database operations
      const paymentData = {
        piAmount: '100.00000000', // Default amount for test
        usdAmount: '10.0000', // Default amount for test
        piPriceAtTime: '0.1000', // Default price for test
        status: 'completed',
        gameAccount: {}, // Empty game account
        metadata: {
          isTestnet: true,
          timestamp: new Date().toISOString()
        }
      };
      
      await storeMockPayment(paymentId, txid, paymentData);
      
      console.log('✅ Payment processed successfully');
    } catch (dbError) {
      console.error('❌ Database operation error:', dbError.message);
      // Continue with the response even if database operation fails
    }
    
    // For any other payment ID in Testnet mode, return Pi Browser expected format
    return res.status(200).json({
      paymentId: paymentId,
      status: "success",
      transaction: {
        txid: txid,
        verified: true
      }
    });
  }
}