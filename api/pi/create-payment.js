// /api/pi/create-payment.js
// This endpoint handles payment creation by calling the Pi Network API
// All Pi Network API calls must go through serverless functions for security

import fetch from "node-fetch";

export default async function handler(req, res) {
  // This endpoint should not be used to create payments directly
  // Payments should be created using the client-side Pi SDK
  // This is kept for backward compatibility but should redirect to proper flow
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Log the attempt for debugging
  console.log("WARNING: Direct call to /api/pi/create-payment detected");
  console.log("This endpoint should not be called directly in production");
  console.log("Payments should be created using the client-side Pi SDK");

  // For testnet/debugging purposes, we can create a mock response
  // In production, this should never be called directly
  const isTestnet = process.env.PI_SANDBOX_MODE === 'true' || process.env.NODE_ENV !== 'production';
  
  if (isTestnet) {
    console.log("Testnet mode: Returning mock payment response");
    
    // Return a mock payment object for testing
    const mockPayment = {
      identifier: 'mock-payment-' + Date.now(),
      user_uid: req.body?.user_uid || 'mock-user-uid',
      amount: req.body?.amount || 1,
      memo: req.body?.memo || 'Mock payment',
      metadata: req.body?.metadata || {},
      from_address: 'mock-from-address',
      to_address: 'mock-to-address',
      direction: 'user_to_app',
      created_at: new Date().toISOString(),
      network: process.env.PI_SANDBOX_MODE === 'true' ? 'Pi Testnet' : 'Pi Network',
      status: {
        developer_approved: false,
        transaction_verified: false,
        developer_completed: false,
        cancelled: false,
        user_cancelled: false
      },
      transaction: null
    };

    return res.status(200).json(mockPayment);
  } else {
    // In production, return an error indicating this endpoint should not be used
    return res.status(400).json({ 
      message: "Payments should be created using the client-side Pi SDK",
      error: "Incorrect payment creation method",
      details: "Use the Pi.createPayment() function in the client-side SDK instead of calling this endpoint directly"
    });
  }
}