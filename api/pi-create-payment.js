// /api/pi-create-payment.js (Step 10)

import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { amount, packageId, gameAccount } = req.body;

  if (!amount || !packageId) {
    return res.status(400).json({ message: "Amount and packageId required" });
  }

  // Validate PI_SERVER_API_KEY
  if (!process.env.PI_SERVER_API_KEY || process.env.PI_SERVER_API_KEY === 'your_actual_pi_server_api_key_here') {
    console.error('PI_SERVER_API_KEY not configured properly');
    return res.status(500).json({ 
      message: 'PI_SERVER_API_KEY not configured properly', 
      error: 'Missing PI_SERVER_API_KEY environment variable' 
    });
  }

  try {
    console.log('Creating payment with Pi Network, amount:', amount, 'packageId:', packageId);
    const response = await fetch("https://sandbox.minepi.com/v2/payments", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amount,
        currency: "PI",
        memo: `Purchase ${packageId}`,
        metadata: {
          type: "buy_gaming_currency",
          packageId: packageId,
          gameAccount: gameAccount || {}
        }
      })
    });
    console.log('Pi payment creation response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('Pi payment creation failed:', data);
      return res.status(response.status).json({ error: data });
    }

    // Return payment ID to frontend for Step 11
    console.log('Pi payment created successfully, paymentId:', data.identifier);
    return res.status(200).json({ paymentId: data.identifier, paymentData: data });

  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ error: error.message });
  }
}