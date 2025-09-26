// /api/pi/create-payment.js
// Use built-in fetch (Node.js 18+) or node-fetch
const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Ensure sandbox mode
  const piApiUrl = "https://sandbox.minepi.com/v2/payments";
  console.log("Using Pi Testnet API URL:", piApiUrl);

  if (!process.env.PI_SERVER_API_KEY) {
    return res.status(500).json({
      error: "PI_SERVER_API_KEY missing",
    });
  }

  const paymentData = req.body?.paymentData;
  if (!paymentData?.amount) {
    return res.status(400).json({ error: "Amount missing" });
  }

  try {
    const response = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount: paymentData.amount,
        memo: paymentData.memo || "B4U Esports Testnet Payment",
        metadata: paymentData.metadata || {},
      }),
    });

    console.log("Pi Testnet API response status:", response.status);

    if (response.status === 403) {
      const text = await response.text();
      return res.status(403).json({
        error: "Pi Testnet API access blocked",
        message: "403 Forbidden — Check endpoint & headers",
        response: text.substring(0, 500),
      });
    }

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);

  } catch (error) {
    console.error("Testnet payment creation error:", error);
    return res.status(500).json({ error: error.message });
  }
}