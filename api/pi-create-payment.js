// /api/pi-create-payment.js

import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { amount, packageId, gameAccount } = req.body;

  if (!amount || !packageId) {
    return res.status(400).json({ message: "Amount and packageId required" });
  }

  if (!process.env.PI_SERVER_API_KEY) {
    return res.status(500).json({ message: "PI_SERVER_API_KEY not set" });
  }

  try {
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

    const data = await response.json();

    if (!response.ok) {
      console.error("Step 10 Error Response:", data);
      return res.status(response.status).json({ error: data });
    }

    console.log("Step 10 Payment Created:", data);

    return res.status(200).json({
      paymentId: data.identifier,
      paymentData: data
    });

  } catch (error) {
    console.error("Step 10 Exception:", error);
    return res.status(500).json({ error: error.message });
  }
}