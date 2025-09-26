// /api/mock-pi-payment.js
const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  console.log("🔹 Completing mock Pi payment...");
  console.log("PI_SANDBOX_MODE:", process.env.PI_SANDBOX_MODE);
  console.log("PI_SERVER_API_KEY:", process.env.PI_SERVER_API_KEY ? "✅ SET" : "❌ MISSING");

  const isSandbox = process.env.PI_SANDBOX_MODE === "true";
  const piApiUrlBase = isSandbox
    ? "https://sandbox.minepi.com/v2/payments"
    : "https://api.minepi.com/v2/payments";

  if (!process.env.PI_SERVER_API_KEY) {
    return res.status(500).json({
      error: "PI_SERVER_API_KEY is not configured",
      message: "Please set PI_SERVER_API_KEY in your environment variables"
    });
  }

  const { paymentId } = req.body;
  if (!paymentId) {
    return res.status(400).json({ 
      error: "Invalid payment data",
      message: "Payment ID is required" 
    });
  }

  console.log("Completing payment with Pi Network, paymentId:", paymentId);

  try {
    const piApiUrl = `${piApiUrlBase}/${paymentId}/complete`;
    console.log("Using Pi API URL:", piApiUrl);

    const completionResponse = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`, // SERVER API KEY here
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "B4U-Esports-App/1.0"
      },
      body: JSON.stringify({
        txid: "mock-tx-" + Date.now()
      })
    });

    console.log("Pi Network API status:", completionResponse.status);

    const contentType = completionResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await completionResponse.text();
      console.error("❌ Non-JSON response from Pi Network:", textResponse.substring(0, 500));

      return res.status(completionResponse.status).json({
        error: "Invalid response from Pi Network",
        message: textResponse
      });
    }

    const completionData = await completionResponse.json();
    if (!completionResponse.ok) {
      console.error("❌ Pi Network API error:", completionData);
      return res.status(completionResponse.status).json({
        error: "Pi Network API error",
        details: completionData
      });
    }

    console.log("✅ Payment completed successfully:", completionData);
    return res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      completionData
    });

  } catch (error) {
    console.error("❌ Payment completion failed:", error);
    return res.status(500).json({
      error: "Payment completion failed",
      message: error.message
    });
  }
}