// Pi Network payment approval endpoint for Vercel
export default async function paymentApprovalHandler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  // Always use Testnet URL
  const piApiUrlBase = "https://sandbox.minepi.com/v2/payments";

  if (!process.env.PI_SERVER_API_KEY) {
    return response.status(500).json({ 
      error: "Server configuration error",
      message: "PI_SERVER_API_KEY missing - check Vercel environment variables"
    });
  }

  const body = request.body || {};
  const { paymentId } = body;
  
  if (!paymentId) {
    return response.status(400).json({ 
      error: "Invalid request", 
      message: "Payment ID is required" 
    });
  }

  try {
    const piApiUrl = `${piApiUrlBase}/${paymentId}/approve`;
    
    console.log("🔄 Approving payment with Pi Network Testnet API...");
    console.log("🌐 URL:", piApiUrl);

    const piResponse = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    });

    console.log("📥 Pi API Response Status:", piResponse.status);

    // Handle non-JSON responses
    const textResponse = await piResponse.text();
    
    // Check if response is HTML (indicating CDN error)
    if (textResponse.startsWith('<!DOCTYPE') || textResponse.includes('<HTML')) {
      console.error("❌ CDN BLOCK DETECTED - Response is HTML instead of JSON");
      return response.status(403).json({
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
      return response.status(500).json({
        error: "Invalid API Response",
        message: "Pi Network API returned non-JSON response",
        rawResponse: textResponse.substring(0, 1000)
      });
    }

    if (!piResponse.ok) {
      console.error(`❌ Pi API Error ${piResponse.status}:`, data);
      return response.status(piResponse.status).json({
        error: "Pi Network API Error",
        message: `API returned status ${piResponse.status}`,
        details: data
      });
    }

    console.log("✅ Payment approved successfully:", data);
    return response.status(200).json(data);

  } catch (error) {
    console.error("💥 Payment approval failed:", error);
    return response.status(500).json({ 
      error: "Payment Approval Failed",
      message: error.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    });
  }
}