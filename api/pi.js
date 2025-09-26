// /api/pi.js - Consolidated Pi Network API handler for Vercel (Testnet mode only)
// This single file replaces multiple Pi API routes to avoid Vercel's 12-function limit

const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function handler(req, res) {
  const { method, query, body } = req;
  const action = query.action; // e.g. /api/pi?action=create-payment

  console.log("Pi API Handler → Action:", action);

  try {
    switch (action) {
      case "price": {
        // Example price (you might replace with real API if needed)
        const piPrice = 0.26;
        console.log("Extracted price:", piPrice);
        return res.status(200).json({ price: piPrice });
      }

      case "balance": {
        // Mock balance for testnet
        const balance = 1000.0;
        console.log("Routing to Pi balance handler");
        return res.status(200).json({ balance });
      }

      case "auth": {
        console.log("=== AUTH API ENDPOINT FINISHED ===");
        return res.status(200).json({ success: true, user: body.user || {} });
      }

      case "create-payment": {
        if (method !== "POST") {
          return res.status(405).json({ message: "Method not allowed" });
        }

        console.log("Creating Pi payment (sandbox mode only)");

        const piApiUrl = "https://sandbox.minepi.com/v2/payments";
        const apiKey = "2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya";

        const response = await fetch(piApiUrl, {
          method: "POST",
          headers: {
            Authorization: `Key ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            amount: body.amount,
            memo: body.memo || "B4U Esports Payment",
            metadata: body.metadata || {},
          }),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text();
          console.error("Non-JSON response:", textResponse.substring(0, 300));
          return res.status(response.status).json({
            error: "Invalid response from Pi Network",
            message: textResponse,
          });
        }

        const data = await response.json();
        console.log("Payment API response:", data);
        return res.status(response.status).json(data);
      }

      case "approve-payment": {
        if (method !== "POST") {
          return res.status(405).json({ message: "Method not allowed" });
        }

        console.log("Approving Pi payment (sandbox mode only)");

        const { paymentId } = body;
        if (!paymentId) {
          return res.status(400).json({ error: "Payment ID required" });
        }

        const piApiUrl = `https://sandbox.minepi.com/v2/payments/${paymentId}/approve`;
        const apiKey = "2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya";

        const response = await fetch(piApiUrl, {
          method: "POST",
          headers: {
            Authorization: `Key ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text();
          console.error("Non-JSON response:", textResponse.substring(0, 300));
          return res.status(response.status).json({
            error: "Invalid response from Pi Network",
            message: textResponse,
          });
        }

        const data = await response.json();
        console.log("Payment approval API response:", data);
        return res.status(response.status).json(data);
      }

      case "complete-payment": {
        if (method !== "POST") {
          return res.status(405).json({ message: "Method not allowed" });
        }

        console.log("Completing Pi payment (sandbox mode only)");

        const { paymentId, txid } = body;
        if (!paymentId || !txid) {
          return res.status(400).json({ error: "Payment ID and txid required" });
        }

        const piApiUrl = `https://sandbox.minepi.com/v2/payments/${paymentId}/complete`;
        const apiKey = "2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya";

        const response = await fetch(piApiUrl, {
          method: "POST",
          headers: {
            Authorization: `Key ${apiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            txid: txid
          }),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const textResponse = await response.text();
          console.error("Non-JSON response:", textResponse.substring(0, 300));
          return res.status(response.status).json({
            error: "Invalid response from Pi Network",
            message: textResponse,
          });
        }

        const data = await response.json();
        console.log("Payment completion API response:", data);
        return res.status(response.status).json(data);
      }

      case "user": {
        // Mock user data for testnet
        const mockUser = {
          id: 'mock-user-' + Date.now(),
          piUID: 'mock-pi-uid',
          username: 'mock_user',
          email: 'mock@example.com',
          phone: '+1234567890',
          country: 'US',
          language: 'en',
          walletAddress: 'mock-wallet-address',
          gameAccounts: {},
          profileImageUrl: null,
          isProfileVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return res.status(200).json(mockUser);
      }

      case "webhook": {
        // Handle Pi Network webhook
        if (method !== 'POST') {
          return res.status(405).json({ message: 'Method not allowed' });
        }

        // In Vercel, the request body is already parsed as JSON
        const requestBody = body || {};
        
        const { action: webhookAction, paymentId, txid } = requestBody;
        
        // Log the webhook event
        console.log('Pi Network webhook received:', { action: webhookAction, paymentId, txid });
        
        // Acknowledge the webhook
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("Pi API handler error:", error);
    return res.status(500).json({ error: error.message });
  }
}