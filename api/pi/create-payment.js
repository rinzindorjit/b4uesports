// /api/pi/create-payment.js
// Use built-in fetch when available (Node.js 18+ in Vercel) to avoid compatibility issues
const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  console.log("Creating Pi payment...");
  console.log("PI_SANDBOX_MODE:", process.env.PI_SANDBOX_MODE);
  console.log("PI_SANDBOX_MODE type:", typeof process.env.PI_SANDBOX_MODE);
  console.log("PI_SANDBOX_MODE truthy:", !!process.env.PI_SANDBOX_MODE);
  console.log("All env keys:", Object.keys(process.env).filter(key => key.includes('PI')));

  // Log the API key (first 4 characters only for security)
  console.log("PI_SERVER_API_KEY configured:", !!process.env.PI_SERVER_API_KEY);

  try {
    // Select correct endpoint based on sandbox mode
    // Using the user's suggested approach to ensure we're using the correct endpoint
    const piApiUrl = process.env.PI_SANDBOX_MODE 
      ? "https://sandbox.minepi.com/v2/payments"
      : "https://api.minepi.com/v2/payments";

    console.log("Using Pi API URL:", piApiUrl);

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
    console.log("Pi Network API headers:", [...response.headers.entries()]);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Non-JSON response from Pi Network:", textResponse.substring(0, 500));

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