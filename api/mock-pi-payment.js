// /api/mock-pi-payment.js
// Use built-in fetch (Node.js 18+) or node-fetch
const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const piApiUrlBase = "https://sandbox.minepi.com/v2/payments"; // Always Testnet

  if (!process.env.PI_SERVER_API_KEY) {
    return res.status(500).json({ error: "Missing PI_SERVER_API_KEY" });
  }

  const { paymentId } = req.body;
  if (!paymentId) {
    return res.status(400).json({ error: "Payment ID missing" });
  }

  try {
    const piApiUrl = `${piApiUrlBase}/${paymentId}/complete`;

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

    const text = await completionResponse.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!completionResponse.ok) {
      return res.status(completionResponse.status).json({
        error: "Pi Testnet API error",
        details: data,
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}