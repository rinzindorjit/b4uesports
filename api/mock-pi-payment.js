// /api/mock-pi-payment.js (Step 11)

import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ message: "paymentId is required" });
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
    console.log('Completing payment with Pi Network, paymentId:', paymentId);
    const completionResponse = await fetch(
      `https://sandbox.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          txid: "mock-tx-" + Date.now()
        })
      }
    );
    console.log('Pi payment completion response status:', completionResponse.status);

    const completionData = await completionResponse.json();

    if (!completionResponse.ok) {
      console.error('Pi payment completion failed:', completionData);
      return res.status(completionResponse.status).json({ error: completionData });
    }

    console.log('Pi payment completed successfully, paymentId:', paymentId);
    return res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      completionData
    });

  } catch (error) {
    console.error('Payment completion error:', error);
    return res.status(500).json({ error: error.message });
  }
}
