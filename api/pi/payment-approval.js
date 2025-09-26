// Pi Network payment approval endpoint for Vercel
// Use built-in fetch (Node.js 18+) or node-fetch
const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function paymentApprovalHandler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  const piApiUrlBase = "https://sandbox.minepi.com/v2/payments"; // Always Testnet

  if (!process.env.PI_SERVER_API_KEY) {
    return response.status(500).json({ error: "Missing PI_SERVER_API_KEY" });
  }

  const body = request.body || {};
  const { paymentId } = body;
  
  if (!paymentId) {
    return response.status(400).json({ error: "Payment ID missing" });
  }

  try {
    const piApiUrl = `${piApiUrlBase}/${paymentId}/approve`;

    const piResponse = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    });

    const text = await piResponse.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!piResponse.ok) {
      return response.status(piResponse.status).json({
        error: "Pi Testnet API error",
        details: data,
      });
    }

    return response.status(200).json(data);

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}