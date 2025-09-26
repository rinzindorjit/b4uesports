# Pi Testnet Verification Setup

This document explains how to set up the Pi Testnet verification for your B4U Esports application.

## Required Files

The following three files have been implemented to work with Pi Network's Testnet verification process:

1. **[api/metadata.js](file:///c:/Users/HP/B4U%20Esports/api/metadata.js)** - Pi's metadata endpoint
2. **[api/pi/payment-approval.js](file:///c:/Users/HP/B4U%20Esports/api/pi/payment-approval.js)** - Step 10 handler (approves payment)
3. **[api/pi/payment-completion.js](file:///c:/Users/HP/B4U%20Esports/api/pi/payment-completion.js)** - Step 11 handler (completes payment)

## Setup Instructions

### 1. Configure Environment Variables

Update your `.env` file with your actual Pi Network API keys:

```env
PI_SECRET_KEY=your_actual_pi_secret_key_here
PI_SERVER_API_KEY=your_actual_pi_server_api_key_here
PI_APP_ID=your_actual_app_id_here
```

You can get these values from the [Pi Developer Portal](https://developers.minepi.com/).

**Important**: Make sure to replace `your_actual_pi_server_api_key_here` with your actual server API key. The endpoints will not work if this is not properly configured.

### 2. Deploy to Vercel

Deploy your application to Vercel. The endpoints will be available at:

- Metadata endpoint: `https://your-app.vercel.app/api/metadata`
- Payment approval endpoint: `https://your-app.vercel.app/api/payment/approve`
- Payment completion endpoint: `https://your-app.vercel.app/api/payment/complete`

### 3. Configure Pi Developer Portal

In the Pi Developer Portal, set up your app with the following configuration:

1. Go to [Pi Developer Portal](https://developers.minepi.com/)
2. Select your app
3. In the "Testnet" section, enter your metadata URL:
   ```
   https://your-app.vercel.app/api/metadata
   ```

### 4. Test the Payment Flow

The payment flow works as follows:

1. Frontend uses `Pi.createPayment()` to create a payment in Pi Testnet
2. Pi calls the `payment_create` endpoint (our approval endpoint) when the user confirms the payment
3. Pi calls the `payment_complete` endpoint (our completion endpoint) after the blockchain transaction is submitted

## File Details

### 1. Metadata Endpoint ([api/metadata.js](file:///c:/Users/HP/B4U%20Esports/api/metadata.js))

This endpoint tells Pi where to find your Step 10 and Step 11 handlers.

```javascript
export default function handler(req, res) {
  res.status(200).json({
    application: {
      name: "B4U Esports",
      description: "Pi Network Integrated Marketplace for Gaming Currency",
      version: "1.0.0",
      platform: "Pi Network",
      category: "Gaming"
    },
    payment: {
      currency: "PI",
      supported_operations: ["buy_gaming_currency", "deposit", "withdrawal"],
      min_amount: 0.1,
      max_amount: 10000
    },
    endpoints: {
      authentication: "https://b4uesports.vercel.app/api/pi/auth",
      payment_create: "https://b4uesports.vercel.app/api/payment/approve",
      payment_complete: "https://b4uesports.vercel.app/api/payment/complete",
      user_profile: "https://b4uesports.vercel.app/api/pi/user"
    },
    contact: {
      support_email: "info@b4uesports.com",
      website: "https://b4uesports.vercel.app" // Updated to correct URL
    },
    last_updated: new Date().toISOString()
  });
}
```

### 2. Payment Approval Endpoint ([api/pi/payment-approval.js](file:///c:/Users/HP/B4U%20Esports/api/pi/payment-approval.js)) - Step 10

This endpoint approves a payment with the Pi Network.

```
// Pi Network payment approval endpoint for Vercel
const fetch = globalThis.fetch;
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

  try {
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

      console.log("Making request to Pi Network with headers:");
      console.log("- Authorization: Key ***" + process.env.PI_SERVER_API_KEY.slice(-4));
      console.log("- Content-Type: application/json");
      console.log("- Accept: application/json");
      console.log("- User-Agent: B4U-Esports-App/1.0");

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
      console.log("Pi Network API headers:", [...piResponse.headers.entries()]);

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
        message: error.message,
        stack: error.stack
      });
    }
  } catch (error) {
    console.error("Payment approval exception:", error);
    console.error("Error stack:", error.stack);
    
    // If it's a fetch error, provide more details
    if (error.type === 'system' || error.code) {
      return response.status(500).json({ 
        error: "Network error when calling Pi Network API",
        details: {
          type: error.type,
          code: error.code,
          message: error.message
        }
      });
    }
    
    return response.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}
```

### 3. Payment Completion Endpoint ([api/pi/payment-completion.js](file:///c:/Users/HP/B4U%20Esports/api/pi/payment-completion.js)) - Step 11

This endpoint completes the payment with the Pi Network.

```
// Pi Network payment completion endpoint for Vercel
const fetch = globalThis.fetch;
import { withCORS } from '../utils/cors.js';

export default withCORS(paymentCompletionHandler);

async function paymentCompletionHandler(request, response) {
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

  try {
    console.log("🔹 Completing Pi payment...");
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
    const { paymentId, txid } = body;
    
    if (!paymentId || !txid) {
      return response.status(400).json({ 
        error: "Invalid payment data",
        message: "Payment ID and txid are required" 
      });
    }

    console.log("Completing payment with Pi Network, paymentId:", paymentId, "txid:", txid);

    try {
      const piApiUrl = `${piApiUrlBase}/${paymentId}/complete`;
      console.log("Using Pi API URL:", piApiUrl);

      console.log("Making request to Pi Network with headers:");
      console.log("- Authorization: Key ***" + process.env.PI_SERVER_API_KEY.slice(-4));
      console.log("- Content-Type: application/json");
      console.log("- Accept: application/json");
      console.log("- User-Agent: B4U-Esports-App/1.0");

      const piResponse = await fetch(piApiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`, // SERVER API KEY here
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "B4U-Esports-App/1.0"
        },
        body: JSON.stringify({
          txid: txid
        })
      });

      console.log("Pi Network API status:", piResponse.status);
      console.log("Pi Network API headers:", [...piResponse.headers.entries()]);

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

      console.log("✅ Payment completed successfully:", data);
      return response.status(200).json(data);

    } catch (error) {
      console.error("❌ Payment completion failed:", error);
      return response.status(500).json({
        error: "Payment completion failed",
        message: error.message,
        stack: error.stack
      });
    }
  } catch (error) {
    console.error("Payment completion exception:", error);
    console.error("Error stack:", error.stack);
    
    // If it's a fetch error, provide more details
    if (error.type === 'system' || error.code) {
      return response.status(500).json({ 
        error: "Network error when calling Pi Network API",
        details: {
          type: error.type,
          code: error.code,
          message: error.message
        }
      });
    }
    
    return response.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}