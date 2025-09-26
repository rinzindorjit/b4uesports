// /api/mock-pi-payment.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Always use Testnet URL
  const piApiUrlBase = "https://sandbox.minepi.com/v2/payments";

  // Use the correct API key as specified by the user
  const PI_SERVER_API_KEY = "2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya";

  const { paymentId } = req.body;
  if (!paymentId) {
    return res.status(400).json({ 
      error: "Invalid request", 
      message: "Payment ID is required" 
    });
  }

  try {
    const piApiUrl = `${piApiUrlBase}/${paymentId}/complete`;
    
    console.log("🔄 Completing mock payment with Pi Network Testnet API...");
    console.log("🌐 URL:", piApiUrl);

    const completionResponse = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "B4U-Esports-Server/1.0",
        "Cache-Control": "no-cache"
      },
      body: JSON.stringify({
        txid: "mock-tx-" + Date.now()
      })
    });

    console.log("📥 Pi API Response Status:", completionResponse.status);

    // Check if we're hitting CloudFront by looking at the headers
    const serverHeader = completionResponse.headers.get('server');
    const viaHeader = completionResponse.headers.get('via');
    const cfId = completionResponse.headers.get('x-amz-cf-id');
    
    console.log("🔧 Debug: Server header:", serverHeader);
    console.log("🔧 Debug: Via header:", viaHeader);
    console.log("🔧 Debug: CF ID:", cfId);

    // Handle non-JSON responses
    const textResponse = await completionResponse.text();
    
    // Check if response is HTML (indicating CDN error)
    if (textResponse.startsWith('<!DOCTYPE') || textResponse.includes('<HTML')) {
      console.error("❌ CDN BLOCK DETECTED - Response is HTML instead of JSON");
      return res.status(403).json({
        error: "CDN Blocking Request",
        message: "Request blocked by CDN - ensure you're hitting the correct Pi Network API endpoint",
        details: "This distribution is not configured to allow the HTTP request method that was used for this request. The distribution supports only cachable requests.",
        rawResponsePreview: textResponse.substring(0, 500),
        diagnosticInfo: {
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
      return res.status(500).json({
        error: "Invalid API Response",
        message: "Pi Network API returned non-JSON response",
        rawResponse: textResponse.substring(0, 1000)
      });
    }

    if (!completionResponse.ok) {
      console.error(`❌ Pi API Error ${completionResponse.status}:`, data);
      return res.status(completionResponse.status).json({
        error: "Pi Network API Error",
        message: `API returned status ${completionResponse.status}`,
        details: data
      });
    }

    console.log("✅ Mock payment completed successfully:", data);
    return res.status(200).json(data);

  } catch (error) {
    console.error("💥 Mock payment completion failed:", error);
    return res.status(500).json({ 
      error: "Mock Payment Completion Failed",
      message: error.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    });
  }
}