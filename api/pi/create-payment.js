// /api/pi/create-payment.js
// Fixed version to address 403 errors with Pi Network API

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Always use Testnet URL as specified
  const piApiUrl = "https://sandbox.minepi.com/v2/payments";

  // Use the correct API key as specified by the user
  const PI_SERVER_API_KEY = "2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya";

  console.log("🔑 Using hardcoded API Key starting with:", PI_SERVER_API_KEY.substring(0, 10));
  console.log("🔧 Debug: Full API Key length:", PI_SERVER_API_KEY.length);
  console.log("🔧 Debug: API Key characters 0-20:", PI_SERVER_API_KEY.substring(0, 20));

  // Handle both request formats (frontend format and test format)
  let paymentData;
  if (req.body?.paymentData) {
    // Test format
    paymentData = req.body.paymentData;
  } else {
    // Frontend format
    paymentData = {
      amount: req.body?.amount,
      memo: `Purchase ${req.body?.packageId || 'gaming currency'}`,
      metadata: {
        packageId: req.body?.packageId,
        gameAccount: req.body?.gameAccount,
        userUid: req.body?.userUid,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Validate request data
  if (!paymentData?.amount) {
    return res.status(400).json({ 
      error: "Invalid request", 
      message: "Amount is required" 
    });
  }

  try {
    console.log("🔄 Creating payment with Pi Network Testnet API...");
    console.log("🌐 URL:", piApiUrl);
    console.log("💰 Amount:", paymentData.amount);
    console.log("📝 Memo:", paymentData.memo || "B4U Esports Testnet Payment");
    console.log("📦 Package ID:", paymentData.metadata?.packageId);
    console.log("👤 User UID:", paymentData.metadata?.userUid);

    // First, let's try a simple GET request to see if we can reach the endpoint
    console.log("🔍 Testing connectivity with GET request...");
    try {
      const getResponse = await fetch(piApiUrl, {
        method: "GET",
        headers: {
          "Authorization": `Key ${PI_SERVER_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        }
      });
      console.log("🔍 GET request status:", getResponse.status);
      if (getResponse.status !== 405) { // 405 is expected for GET on this endpoint
        console.log("🔍 GET request unexpected status, headers:", [...getResponse.headers.entries()]);
      }
    } catch (getError) {
      console.log("🔍 GET request error:", getError.message);
    }

    // Make request to Pi Network API with proper error handling
    const response = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "B4U-Esports-Server/1.0",
        "Cache-Control": "no-cache"
      },
      body: JSON.stringify({
        amount: parseFloat(paymentData.amount),
        memo: paymentData.memo || "B4U Esports Testnet Payment",
        metadata: paymentData.metadata || {},
      }),
    });

    console.log("📥 Pi API Response Status:", response.status);
    console.log("📥 Pi API Response Headers:", [...response.headers.entries()]);

    // Check if we're hitting CloudFront by looking at the server header
    const serverHeader = response.headers.get('server');
    const viaHeader = response.headers.get('via');
    const cfId = response.headers.get('x-amz-cf-id');
    
    console.log("🔧 Debug: Server header:", serverHeader);
    console.log("🔧 Debug: Via header:", viaHeader);
    console.log("🔧 Debug: CF ID:", cfId);

    // Handle non-JSON responses (like the 403 HTML error)
    const textResponse = await response.text();
    
    // Check if response is HTML (indicating CDN error)
    if (textResponse.startsWith('<!DOCTYPE') || textResponse.includes('<HTML')) {
      console.error("❌ CDN BLOCK DETECTED - Response is HTML instead of JSON");
      console.error("📋 Response preview:", textResponse.substring(0, 500));
      
      // Let's also check what DNS resolution we're getting
      console.log("🔍 Diagnostic: Checking if we're hitting the right endpoint");
      
      return res.status(403).json({
        error: "CDN Blocking Request",
        message: "Request blocked by CDN - ensure you're hitting the correct Pi Network API endpoint",
        details: "This distribution is not configured to allow the HTTP request method that was used for this request. The distribution supports only cachable requests.",
        rawResponsePreview: textResponse.substring(0, 500),
        diagnosticInfo: {
          url: piApiUrl,
          method: "POST",
          headersSent: {
            "Authorization": "Key [REDACTED]",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "B4U-Esports-Server/1.0",
            "Cache-Control": "no-cache"
          },
          apiKeyLength: PI_SERVER_API_KEY.length,
          apiKeyPrefix: PI_SERVER_API_KEY.substring(0, 10),
          responseHeaders: {
            server: serverHeader,
            via: viaHeader,
            cfId: cfId
          }
        }
      });
    }

    // Try to parse JSON response
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (parseError) {
      console.error("❌ Failed to parse JSON response:", parseError.message);
      console.error("📋 Raw response:", textResponse.substring(0, 1000));
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