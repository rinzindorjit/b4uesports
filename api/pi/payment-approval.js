// Pi Network payment approval endpoint for Vercel
const fetch = globalThis.fetch || (await import("node-fetch")).default;
import { withCORS } from '../utils/cors.js';

export default withCORS(paymentApprovalHandler);

async function paymentApprovalHandler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  console.log("🔹 Approving Pi payment...");
  console.log("PI_SANDBOX_MODE:", process.env.PI_SANDBOX_MODE);
  console.log("PI_SERVER_API_KEY:", process.env.PI_SERVER_API_KEY ? "✅ SET" : "❌ MISSING");

  const isSandbox = process.env.PI_SANDBOX_MODE === "true";
  const piApiUrlBase = isSandbox
    ? "https://sandbox.minepi.com/v2/payments"
    : "https://api.minepi.com/v2/payments";

  if (!process.env.PI_SERVER_API_KEY) {
    return response.status(500).json({
      error: "PI_SERVER_API_KEY is not configured",
      message: "Please set PI_SERVER_API_KEY in your environment variables"
    });
  }

  // In Vercel, the request body is already parsed as JSON
  const body = request.body || {};
  const { paymentId } = body;
  
  if (!paymentId) {
    return response.status(400).json({ 
      error: "Invalid payment data",
      message: "Payment ID is required" 
    });
  }

  console.log("Approving payment with Pi Network, paymentId:", paymentId);

  try {
    const piApiUrl = `${piApiUrlBase}/${paymentId}/approve`;
    console.log("Using Pi API URL:", piApiUrl);

    const piResponse = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`, // SERVER API KEY here
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "B4U-Esports-App/1.0"
      }
    });

    console.log("Pi Network API status:", piResponse.status);

    const contentType = piResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await piResponse.text();
      console.error("❌ Non-JSON response from Pi Network:", textResponse.substring(0, 500));

      return response.status(piResponse.status).json({
        error: "Invalid response from Pi Network",
        message: textResponse
      });
    }

    const data = await piResponse.json();
    if (!piResponse.ok) {
      console.error("❌ Pi Network API error:", data);
      return response.status(piResponse.status).json({
        error: "Pi Network API error",
        details: data
      });
    }

    console.log("✅ Payment approved successfully:", data);
    return response.status(200).json(data);

  } catch (error) {
    console.error("❌ Payment approval failed:", error);
    return response.status(500).json({
      error: "Payment approval failed",
      message: error.message
    });
  }
}