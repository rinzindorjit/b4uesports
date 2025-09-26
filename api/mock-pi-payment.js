// /api/mock-pi-payment.js

import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ message: "paymentId is required" });
  }

  if (!process.env.PI_SERVER_API_KEY) {
    return res.status(500).json({ message: "PI_SERVER_API_KEY not set" });
  }

  try {
    console.log("Step 11 starting for paymentId:", paymentId);

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

    const completionData = await completionResponse.json();

    if (!completionResponse.ok) {
      console.error("Step 11 completion failed:", completionData);
      return res.status(completionResponse.status).json({ error: completionData });
    }

    console.log("Step 11 payment completed successfully:", completionData);

    return res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      completionData
    });

  } catch (error) {
    console.error("Step 11 Exception:", error);
    return res.status(500).json({ error: error.message });
  }
}
