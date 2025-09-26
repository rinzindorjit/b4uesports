// /api/pi/create-payment.js
// Use built-in fetch (Node.js 18+) or node-fetch
const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const piApiUrl = "https://sandbox.minepi.com/v2/payments"; // Always Testnet

  if (!process.env.PI_SERVER_API_KEY) {
    return res.status(500).json({ error: "Missing PI_SERVER_API_KEY" });
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

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Pi Testnet API error",
        details: data,
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}