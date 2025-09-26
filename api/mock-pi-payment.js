// /api/mock-pi-payment.js

import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ message: "paymentId is required" });
  }

  if (!process.env.PI_SERVER_API_KEY || process.env.PI_SERVER_API_KEY === 'your_actual_pi_server_api_key_here') {
    console.error('PI_SERVER_API_KEY not configured properly');
    return res.status(500).json({ 
      message: 'PI_SERVER_API_KEY not configured properly', 
      error: 'Missing PI_SERVER_API_KEY environment variable' 
    });
  }

  try {
    console.log("Step 11 starting for paymentId:", paymentId);
    console.log("Using API key starting with:", process.env.PI_SERVER_API_KEY?.substring(0, 10) || "NOT SET");

    // Use the correct endpoint based on sandbox mode - CONSISTENT WITH OTHER FILES
    const piApiUrl = process.env.PI_SANDBOX_MODE === "true" 
      ? `https://sandbox.minepi.com/v2/payments/${paymentId}/complete` 
      : `https://api.minepi.com/v2/payments/${paymentId}/complete`;
      
    const completionResponse = await fetch(
      piApiUrl,
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          txid: "mock-tx-" + Date.now()
        })
      }
    );

    console.log("Pi Network completion response status:", completionResponse.status);
    console.log("Pi Network completion response headers:", [...completionResponse.headers.entries()]);
    
    // Check if the response is JSON before trying to parse it
    const contentType = completionResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await completionResponse.text();
      console.error("Non-JSON response from Pi Network:", textResponse.substring(0, 500));
      return res.status(completionResponse.status).json({ 
        error: "Invalid response from Pi Network",
        responsePreview: textResponse.substring(0, 500),
        contentType: contentType
      });
    }

    const completionData = await completionResponse.json();

    if (!completionResponse.ok) {
      console.error("Step 11 completion failed:", completionData);
      return res.status(completionResponse.status).json({ error: completionData });
    }

    console.log("Step 11 payment completed successfully:", completionData);

    return res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      completionData
    });

  } catch (error) {
    console.error("Step 11 Exception:", error);
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