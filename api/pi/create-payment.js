// /api/pi/create-payment.js
// This endpoint confirms payments created by the Pi SDK on the client side

import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!process.env.PI_SERVER_API_KEY) {
    console.error("Missing PI_SERVER_API_KEY");
    return res.status(500).json({ error: "Server API key not configured" });
  }

  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: "Missing paymentId" });
    }

    // Use the correct endpoint based on sandbox mode
    const piApiUrl = process.env.PI_SANDBOX_MODE === 'true' 
      ? `https://sandbox.minepi.com/v2/payments/${paymentId}/approve` 
      : `https://api.minepi.com/v2/payments/${paymentId}/approve`;

    console.log(`Approving payment: ${paymentId}`);

    const response = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Pi API error:", data);
      return res.status(response.status).json({
        error: "Pi API error",
        details: data,
      });
    }

    console.log("Payment approved successfully:", data);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Payment approval error:", error);
    return res.status(500).json({
      error: "Payment approval failed",
      message: error.message,
    });
  }
}