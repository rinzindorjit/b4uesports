// /api/pi-create-payment.js

import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { amount, packageId, gameAccount, userUid } = req.body;

  if (!amount || !packageId) {
    return res.status(400).json({ message: "Amount and packageId required" });
  }

  // For Pi Network payments, we need the user's UID
  if (!userUid) {
    return res.status(400).json({ message: "User UID required for Pi Network payment" });
  }

  if (!process.env.PI_SERVER_API_KEY || process.env.PI_SERVER_API_KEY === 'your_actual_pi_server_api_key_here') {
    console.error('PI_SERVER_API_KEY not configured properly');
    return res.status(500).json({ 
      message: 'PI_SERVER_API_KEY not configured properly', 
      error: 'Missing PI_SERVER_API_KEY environment variable' 
    });
  }

  try {
    console.log("Creating payment with Pi Network, amount:", amount, "packageId:", packageId, "userUid:", userUid);
    console.log("Using API key starting with:", process.env.PI_SERVER_API_KEY?.substring(0, 10) || "NOT SET");
    
    // Use the correct endpoint based on sandbox mode
    const piApiUrl = process.env.PI_SANDBOX_MODE === 'true' 
      ? 'https://sandbox.minepi.com/v2/payments' 
      : 'https://api.minepi.com/v2/payments';
      
    const response = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amount,
        user_uid: userUid, // Include the user's UID as required by Pi Network API
        currency: "PI",
        memo: `Purchase ${packageId}`,
        metadata: {
          type: "buy_gaming_currency",
          packageId: packageId,
          gameAccount: gameAccount || {}
        }
      })
    });

    console.log("Pi Network response status:", response.status);
    console.log("Pi Network response headers:", [...response.headers.entries()]);
    
    // Check if the response is JSON before trying to parse it
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error("Non-JSON response from Pi Network:", textResponse.substring(0, 500));
      return res.status(response.status).json({ 
        error: "Invalid response from Pi Network",
        responsePreview: textResponse.substring(0, 500),
        contentType: contentType
      });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("Step 10 Error Response:", data);
      return res.status(response.status).json({ error: data });
    }

    console.log("Step 10 Payment Created:", data);

    return res.status(200).json({
      paymentId: data.identifier,
      paymentData: data
    });

  } catch (error) {
    console.error("Step 10 Exception:", error);
    console.error("Error stack:", error.stack);
    
    // If it's a fetch error, provide more details
    if (error.type === 'system' || error.code) {
      return res.status(500).json({ 
        error: "Network error when calling Pi Network API",
        details: {
          type: error.type,
          code: error.code,
          message: error.message
        }
      });
    }
    
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}