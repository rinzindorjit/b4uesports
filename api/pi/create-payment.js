// /api/pi/create-payment.js
// This endpoint handles payment creation for Pi Network
// Works in both Testnet (sandbox) and Mainnet

// Use built-in fetch when available (Node.js 18+ in Vercel)
const fetch = globalThis.fetch || (await import('node-fetch')).default;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  console.log("Creating Pi payment...");

  // For Pi Network testing, we always use the sandbox endpoint regardless of NODE_ENV
  // This is because Pi requires using sandbox.minepi.com for testnet even in production deployments
  const useSandbox = process.env.PI_SANDBOX_MODE !== 'false';
  
  // Testnet uses sandbox.minepi.com, Mainnet uses api.minepi.com
  const piApiUrl = useSandbox
    ? "https://sandbox.minepi.com/v2/payments"
    : "https://api.minepi.com/v2/payments";
    
  console.log(`Environment: NODE_ENV=${process.env.NODE_ENV}, PI_SANDBOX_MODE=${process.env.PI_SANDBOX_MODE}`);
  console.log(`Using Pi API URL: ${piApiUrl}`);

  // Check API key
  if (!process.env.PI_SERVER_API_KEY || process.env.PI_SERVER_API_KEY === "your_actual_pi_server_api_key_here") {
    console.error("Missing PI_SERVER_API_KEY in environment variables.");
    return res.status(500).json({
      error: "Missing PI_SERVER_API_KEY",
      message: "Please set PI_SERVER_API_KEY in your environment variables"
    });
  }

  try {
    const paymentData = req.body?.paymentData;

    if (!paymentData || !paymentData.amount) {
      return res.status(400).json({
        error: "Invalid payment data",
        message: "Payment amount and memo are required"
      });
    }

    console.log("Payment data:", paymentData);

    const response = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "B4U-Esports-App/1.0",
        "Cache-Control": "no-cache"
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        memo: paymentData.memo || "",
        metadata: paymentData.metadata || {}
      })
    });

    console.log("Pi API status:", response.status);

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Non-JSON response from Pi:", textResponse.substring(0, 500));

      if (response.status === 403) {
        return res.status(403).json({
          error: "Pi Network API access blocked",
          message: "Check if you are calling the correct Pi API endpoint",
          details: textResponse.substring(0, 500)
        });
      }

      return res.status(response.status).json({
        error: "Invalid Pi Network response",
        responsePreview: textResponse.substring(0, 500)
      });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("Pi Network API error:", data);
      return res.status(response.status).json({ error: "Pi Network API error", details: data });
    }

    console.log("Payment created:", data);
    return res.status(200).json(data);

  } catch (error) {
    console.error("Payment creation error:", error);
    return res.status(500).json({ error: "Payment creation failed", message: error.message });
  }
}