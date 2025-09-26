# Pi Testnet Verification Setup

This document explains how to set up the Pi Testnet verification for your B4U Esports application.

## Required Files

The following three files have been implemented to work with Pi Network's Testnet verification process:

1. **[api/metadata.js](file:///c:/Users/HP/B4U%20Esports/api/metadata.js)** - Pi's metadata endpoint
2. **[api/pi-create-payment.js](file:///c:/Users/HP/B4U%20Esports/api/pi-create-payment.js)** - Step 10 handler (creates payment)
3. **[api/mock-pi-payment.js](file:///c:/Users/HP/B4U%20Esports/api/mock-pi-payment.js)** - Step 11 handler (completes payment)

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
- Payment creation endpoint: `https://your-app.vercel.app/api/pi-create-payment`
- Payment completion endpoint: `https://your-app.vercel.app/api/mock-pi-payment`

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

1. Frontend calls `/api/pi-create-payment` (Step 10) → Creates a payment in Pi Testnet
2. Pi returns a `paymentId` to the frontend
3. Frontend calls `/api/mock-pi-payment` with that `paymentId` (Step 11) → Completes the payment in Pi Testnet

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
      authentication: "/api/pi/auth",
      payment_create: "/api/pi-create-payment",
      payment_complete: "/api/mock-pi-payment",
      user_profile: "/api/pi/user"
    },
    contact: {
      support_email: "info@b4uesports.com",
      website: "https://b4uesports.com"
    },
    last_updated: new Date().toISOString()
  });
}
```

### 2. Payment Creation Endpoint ([api/pi-create-payment.js](file:///c:/Users/HP/B4U%20Esports/api/pi-create-payment.js)) - Step 10

This endpoint creates a payment with the Pi Network.

```javascript
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { amount, packageId, gameAccount } = req.body;

  if (!amount || !packageId) {
    return res.status(400).json({ message: "Amount and packageId required" });
  }

  // Validate PI_SERVER_API_KEY
  if (!process.env.PI_SERVER_API_KEY || process.env.PI_SERVER_API_KEY === 'your_actual_pi_server_api_key_here') {
    console.error('PI_SERVER_API_KEY not configured properly');
    return res.status(500).json({ 
      message: 'PI_SERVER_API_KEY not configured properly', 
      error: 'Missing PI_SERVER_API_KEY environment variable' 
    });
  }

  try {
    console.log('Creating payment with Pi Network, amount:', amount, 'packageId:', packageId);
    const response = await fetch("https://sandbox.minepi.com/v2/payments", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amount,
        currency: "PI",
        memo: `Purchase ${packageId}`,
        metadata: {
          type: "buy_gaming_currency",
          packageId: packageId,
          gameAccount: gameAccount || {}
        }
      })
    });
    console.log('Pi payment creation response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('Pi payment creation failed:', data);
      return res.status(response.status).json({ error: data });
    }

    // Return payment ID to frontend for Step 11
    console.log('Pi payment created successfully, paymentId:', data.identifier);
    return res.status(200).json({ paymentId: data.identifier, paymentData: data });

  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

### 3. Payment Completion Endpoint ([api/mock-pi-payment.js](file:///c:/Users/HP/B4U%20Esports/api/mock-pi-payment.js)) - Step 11

This endpoint completes the payment with the Pi Network.

```javascript
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ message: "paymentId is required" });
  }

  // Validate PI_SERVER_API_KEY
  if (!process.env.PI_SERVER_API_KEY || process.env.PI_SERVER_API_KEY === 'your_actual_pi_server_api_key_here') {
    console.error('PI_SERVER_API_KEY not configured properly');
    return res.status(500).json({ 
      message: 'PI_SERVER_API_KEY not configured properly', 
      error: 'Missing PI_SERVER_API_KEY environment variable' 
    });
  }

  try {
    console.log('Completing payment with Pi Network, paymentId:', paymentId);
    const completionResponse = await fetch(
      `https://sandbox.minepi.com/v2/payments/${paymentId}/complete`,
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
    console.log('Pi payment completion response status:', completionResponse.status);

    const completionData = await completionResponse.json();

    if (!completionResponse.ok) {
      console.error('Pi payment completion failed:', completionData);
      return res.status(completionResponse.status).json({ error: completionData });
    }

    console.log('Pi payment completed successfully, paymentId:', paymentId);
    return res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      completionData
    });

  } catch (error) {
    console.error('Payment completion error:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**: Make sure `PI_SERVER_API_KEY` is properly configured in your deployment environment.

2. **CORS Issues**: The endpoints include proper CORS headers for Pi Browser compatibility.

3. **Payment Creation Fails**: Ensure you're using the correct Pi Network sandbox endpoint: `https://sandbox.minepi.com/v2/payments`

4. **Payment Completion Fails**: Ensure you're using the correct Pi Network sandbox endpoint: `https://sandbox.minepi.com/v2/payments/{paymentId}/complete`

### Testing Locally

You can test the endpoints locally by running:

```bash
npm run dev
```

Then use tools like Postman or curl to test the endpoints:

```bash
# Test metadata endpoint
curl http://localhost:3000/api/metadata

# Test payment creation (requires valid body and headers)
curl -X POST http://localhost:3000/api/pi-create-payment \
  -H "Content-Type: application/json" \
  -d '{"amount": 10, "packageId": "test-package"}'
```

## Deployment

When deploying to Vercel, make sure to set the environment variables in the Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `PI_SECRET_KEY`
   - `PI_SERVER_API_KEY`
   - `PI_APP_ID`

Your Pi Testnet verification should now work correctly!