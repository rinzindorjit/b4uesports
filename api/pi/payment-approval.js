// Pi Network payment approval endpoint for Vercel
// Use built-in fetch (Node.js 18+) or node-fetch
const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function paymentApprovalHandler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  // Ensure sandbox mode
  const piApiUrlBase = "https://sandbox.minepi.com/v2/payments";
  console.log("Using Pi Testnet API URL base:", piApiUrlBase);

  if (!process.env.PI_SERVER_API_KEY) {
    return response.status(500).json({
      error: "PI_SERVER_API_KEY missing",
    });
  }

  const body = request.body || {};
  const { paymentId } = body;
  
  if (!paymentId) {
    return response.status(400).json({ error: "Payment ID missing" });
  }

  try {
    const piApiUrl = `${piApiUrlBase}/${paymentId}/approve`;
    console.log("Using Pi Testnet API URL:", piApiUrl);

    const piResponse = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    });

    console.log("Pi Testnet API response status:", piResponse.status);

    if (piResponse.status === 403) {
      const text = await piResponse.text();
      return response.status(403).json({
        error: "Pi Testnet API access blocked",
        message: "403 Forbidden — Check endpoint & headers",
        response: text.substring(0, 500),
      });
    }

    const data = await piResponse.json();
    return response.status(piResponse.ok ? 200 : piResponse.status).json(data);

  } catch (error) {
    console.error("Testnet payment approval error:", error);
    return response.status(500).json({ error: error.message });
  }
}
