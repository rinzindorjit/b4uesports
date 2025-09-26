// Diagnostic file to check Pi Network API connectivity
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Log environment info
    console.log('=== Pi Network API Diagnostic ===');
    console.log('PI_SERVER_API_KEY present:', !!process.env.PI_SERVER_API_KEY);
    console.log('PI_SERVER_API_KEY length:', process.env.PI_SERVER_API_KEY?.length || 0);
    console.log('PI_SANDBOX_MODE:', process.env.PI_SANDBOX_MODE);
    
    // Test 1: Simple GET request to see if we can reach the domain
    console.log('Test 1: Checking domain connectivity...');
    try {
      const getResponse = await fetch('https://sandbox.minepi.com/v2/payments', {
        method: 'GET',
        headers: {
          'Authorization': `Key ${process.env.PI_SERVER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('GET request status:', getResponse.status);
    } catch (getError) {
      console.log('GET request error:', getError.message);
    }

    // Test 2: Actual POST request with proper error handling
    console.log('Test 2: Sending POST request to Pi Network API...');
    const piApiUrl = "https://sandbox.minepi.com/v2/payments";
    
    const response = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount: 1.0,
        memo: "Diagnostic Test Payment",
        metadata: { test: true, timestamp: Date.now() },
      }),
    });

    console.log('Pi API Response Status:', response.status);
    console.log('Pi API Response Headers:', [...response.headers.entries()]);
    
    const text = await response.text();
    console.log('Pi API Response Text (first 1000 chars):', text.substring(0, 1000));
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.log('Response is not JSON:', parseError.message);
      data = { rawResponse: text.substring(0, 1000) };
    }

    if (response.status === 403) {
      console.log('❌ 403 ERROR DETECTED - This is the main issue');
      return res.status(403).json({
        error: "Pi Network API Access Blocked",
        message: "403 Forbidden - Check if request is hitting CDN instead of API server",
        response: data,
        diagnostic: {
          url: piApiUrl,
          method: "POST",
          headers: {
            "Authorization": "Key [REDACTED]",
            "Content-Type": "application/json",
            "Accept": "application/json",
          }
        }
      });
    }

    return res.status(response.ok ? 200 : response.status).json({
      message: "Diagnostic completed",
      status: response.status,
      data: data
    });

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return res.status(500).json({ 
      error: "Diagnostic failed",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}