// /api/mock-pi-payment.js
// Use built-in fetch when available (Node.js 18+ in Vercel) to avoid compatibility issues
const fetch = globalThis.fetch || (await import("node-fetch")).default;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ message: "paymentId is required" });
  }

  console.log("Step 11 starting for paymentId:", paymentId);
  console.log("PI_SERVER_API_KEY configured:", !!process.env.PI_SERVER_API_KEY);
  console.log("PI_SANDBOX_MODE:", process.env.PI_SANDBOX_MODE);
  console.log("PI_SANDBOX_MODE type:", typeof process.env.PI_SANDBOX_MODE);
  console.log("PI_SANDBOX_MODE truthy:", !!process.env.PI_SANDBOX_MODE);

  try {
    // Use the correct endpoint based on sandbox mode - using user's suggested approach
    const piApiUrl = process.env.PI_SANDBOX_MODE 
      ? `https://sandbox.minepi.com/v2/payments/${paymentId}/complete` 
      : `https://api.minepi.com/v2/payments/${paymentId}/complete`;
      
    console.log("Using Pi API URL:", piApiUrl);

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