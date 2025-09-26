// /api/pi/create-payment.js
// Fixed version to address 403 errors with Pi Network API

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Always use Testnet URL as specified
  const piApiUrl = "https://sandbox.minepi.com/v2/payments";

  // Validate environment configuration
  if (!process.env.PI_SERVER_API_KEY) {
    console.error("❌ PI_SERVER_API_KEY is missing from environment variables");
    return res.status(500).json({ 
      error: "Server configuration error",
      message: "PI_SERVER_API_KEY missing - check Vercel environment variables"
    });
  }

  // Validate request data
  const paymentData = req.body?.paymentData;
  if (!paymentData?.amount) {
    return res.status(400).json({ 
      error: "Invalid request", 
      message: "Amount is required in paymentData" 
    });
  }

  try {
    console.log("🔄 Creating payment with Pi Network Testnet API...");
    console.log("🌐 URL:", piApiUrl);
    console.log("💰 Amount:", paymentData.amount);
    console.log("📝 Memo:", paymentData.memo || "B4U Esports Testnet Payment");

    // Make request to Pi Network API with proper error handling
    const response = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount: parseFloat(paymentData.amount),
        memo: paymentData.memo || "B4U Esports Testnet Payment",
        metadata: paymentData.metadata || {},
      }),
    });

    console.log("📥 Pi API Response Status:", response.status);

    // Handle non-JSON responses (like the 403 HTML error)
    const textResponse = await response.text();
    
    // Check if response is HTML (indicating CDN error)
    if (textResponse.startsWith('<!DOCTYPE') || textResponse.includes('<HTML')) {
      console.error("❌ CDN BLOCK DETECTED - Response is HTML instead of JSON");
      return res.status(403).json({
        error: "CDN Blocking Request",
        message: "Request blocked by CDN - ensure you're hitting the correct Pi Network API endpoint",
        details: "This distribution is not configured to allow the HTTP request method that was used for this request. The distribution supports only cachable requests.",
        rawResponsePreview: textResponse.substring(0, 500)
      });
    }

    // Try to parse JSON response
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (parseError) {
      console.error("❌ Failed to parse JSON response:", parseError.message);
      return res.status(500).json({
        error: "Invalid API Response",
        message: "Pi Network API returned non-JSON response",
        rawResponse: textResponse.substring(0, 1000)
      });
    }

    // Handle API-level errors
    if (!response.ok) {
      console.error(`❌ Pi API Error ${response.status}:`, data);
      return res.status(response.status).json({
        error: "Pi Network API Error",
        message: `API returned status ${response.status}`,
        details: data
      });
    }

    console.log("✅ Payment created successfully:", data);
    return res.status(200).json(data);

  } catch (error) {
    console.error("💥 Payment creation failed:", error);
    return res.status(500).json({ 
      error: "Payment Creation Failed",
      message: error.message,
      // Include stack trace in development only
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    });
  }
}