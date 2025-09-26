// /api/mock-pi-payment.js
// Use built-in fetch (Node.js 18+) or node-fetch
const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Ensure sandbox mode
  const piApiUrlBase = "https://sandbox.minepi.com/v2/payments";
  console.log("Using Pi Testnet API URL base:", piApiUrlBase);

  if (!process.env.PI_SERVER_API_KEY) {
    return res.status(500).json({
      error: "PI_SERVER_API_KEY missing",
    });
  }

  const { paymentId } = req.body;
  if (!paymentId) {
    return res.status(400).json({ error: "Payment ID missing" });
  }

  try {
    const piApiUrl = `${piApiUrlBase}/${paymentId}/complete`;
    console.log("Using Pi Testnet API URL:", piApiUrl);

    const completionResponse = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        txid: "mock-tx-" + Date.now()
      })
    });

    console.log("Pi Testnet API response status:", completionResponse.status);

    if (completionResponse.status === 403) {
      const text = await completionResponse.text();
      return res.status(403).json({
        error: "Pi Testnet API access blocked",
        message: "403 Forbidden — Check endpoint & headers",
        response: text.substring(0, 500),
      });
    }

    const completionData = await completionResponse.json();
    return res.status(completionResponse.ok ? 200 : completionResponse.status).json(completionData);

  } catch (error) {
    console.error("Testnet payment completion error:", error);
    return res.status(500).json({ error: error.message });
  }
}
