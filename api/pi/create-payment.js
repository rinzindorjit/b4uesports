// /api/pi/create-payment.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  console.log("Creating Pi payment...");

  if (!process.env.PI_SERVER_API_KEY) {
    console.error("Missing PI_SERVER_API_KEY in environment variables");
    return res.status(500).json({
      error: "Missing PI_SERVER_API_KEY",
      message: "Please configure your PI_SERVER_API_KEY in .env"
    });
  }

  try {
    // Select correct endpoint based on sandbox mode
    const piApiUrl = process.env.PI_SANDBOX_MODE === "true"
      ? "https://sandbox.minepi.com/v2/payments"
      : "https://api.minepi.com/v2/payments";

    const paymentData = req.body?.paymentData || {};

    console.log("Payment data:", paymentData);

    const response = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "B4U-Esports-App/1.0"
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        memo: paymentData.memo || "B4U Esports Payment",
        metadata: paymentData.metadata || {}
      })
    });

    console.log("Pi Network API status:", response.status);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Non-JSON response from Pi Network:", textResponse);

      return res.status(response.status).json({
        error: "Invalid response from Pi Network",
        message: textResponse
      });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("Pi Network API error:", data);
      return res.status(response.status).json({
        error: "Pi Network API error",
        details: data
      });
    }

    console.log("Payment created successfully:", data);
    return res.status(200).json(data);

  } catch (error) {
    console.error("Payment creation error:", error);
    return res.status(500).json({
      error: "Payment creation failed",
      message: error.message,
      stack: error.stack
    });
  }
}