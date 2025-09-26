// /api/pi/create-payment.js
const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  console.log("🔹 Creating Pi payment...");
  console.log("PI_SANDBOX_MODE:", process.env.PI_SANDBOX_MODE);
  console.log("PI_SERVER_API_KEY:", process.env.PI_SERVER_API_KEY ? "✅ SET" : "❌ MISSING");

  const isSandbox = process.env.PI_SANDBOX_MODE === "true";
  const piApiUrl = isSandbox
    ? "https://sandbox.minepi.com/v2/payments"
    : "https://api.minepi.com/v2/payments";

  console.log("Using Pi API URL:", piApiUrl);

  if (!process.env.PI_SERVER_API_KEY) {
    return res.status(500).json({
      error: "PI_SERVER_API_KEY is not configured",
      message: "Please set PI_SERVER_API_KEY in your environment variables"
    });
  }

  const paymentData = req.body?.paymentData;
  if (!paymentData || !paymentData.amount) {
    return res.status(400).json({
      error: "Invalid payment data",
      message: "Payment data and amount are required"
    });
  }

  console.log("Payment data:", paymentData);

  try {
    const response = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`, // SERVER API KEY here
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
      console.error("❌ Non-JSON response from Pi Network:", textResponse.substring(0, 500));

      return res.status(response.status).json({
        error: "Invalid response from Pi Network",
        message: textResponse
      });
    }

    const data = await response.json();
    if (!response.ok) {
      console.error("❌ Pi Network API error:", data);
      return res.status(response.status).json({
        error: "Pi Network API error",
        details: data
      });
    }

    console.log("✅ Payment created successfully:", data);
    return res.status(200).json(data);

  } catch (error) {
    console.error("❌ Payment creation failed:", error);
    return res.status(500).json({
      error: "Payment creation failed",
      message: error.message
    });
  }
}