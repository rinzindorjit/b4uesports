# Pi Testnet Verification Setup

This document explains how to set up the Pi Testnet verification for your B4U Esports application.

## Required Files

The following files have been implemented to work with Pi Network's Testnet verification process:

1. **[api/metadata.js](file:///c:/Users/HP/B4U%20Esports/api/metadata.js)** - Pi's metadata endpoint
2. **[api/pi.js](file:///c:/Users/HP/B4U%20Esports/api/pi.js)** - Consolidated Pi Network endpoint handling all operations

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
- Payment approval endpoint: `https://your-app.vercel.app/api/pi?action=approve-payment`
- Payment completion endpoint: `https://your-app.vercel.app/api/pi?action=complete-payment`

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
2. Pi calls the `payment_create` endpoint (our create payment endpoint) when the user confirms the payment
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
      authentication: "https://b4uesports.vercel.app/api/pi?action=auth",
      payment_create: "https://b4uesports.vercel.app/api/pi?action=create-payment",
      payment_approve: "https://b4uesports.vercel.app/api/pi?action=approve-payment",
      payment_complete: "https://b4uesports.vercel.app/api/pi?action=complete-payment",
      user_profile: "https://b4uesports.vercel.app/api/pi?action=user"
    },
    contact: {
      support_email: "info@b4uesports.com",
      website: "https://b4uesports.vercel.app"
    },
    last_updated: new Date().toISOString()
  });
}
```

### 2. Consolidated Pi API Endpoint ([api/pi.js](file:///c:/Users/HP/B4U%20Esports/api/pi.js))

This endpoint handles all Pi Network operations using query parameters:

- Authentication: `/api/pi?action=auth`
- Payment Creation: `/api/pi?action=create-payment`
- Payment Approval: `/api/pi?action=approve-payment`
- Payment Completion: `/api/pi?action=complete-payment`
- User Profile: `/api/pi?action=user`
- Price: `/api/pi?action=price`
- Balance: `/api/pi?action=balance`
- Webhook: `/api/pi?action=webhook`

Example implementation for payment approval:

```javascript
case "approve-payment": {
  if (method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  console.log("Approving Pi payment (sandbox mode only)");

  const { paymentId } = body;
  if (!paymentId) {
    return res.status(400).json({ error: "Payment ID required" });
  }

  const piApiUrl = `https://sandbox.minepi.com/v2/payments/${paymentId}/approve`;
  const apiKey = "2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya";

  const response = await fetch(piApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const textResponse = await response.text();
    console.error("Non-JSON response:", textResponse.substring(0, 300));
    return res.status(response.status).json({
      error: "Invalid response from Pi Network",
      message: textResponse,
    });
  }

  const data = await response.json();
  console.log("Payment approval API response:", data);
  return res.status(response.status).json(data);
}
```

## Testing

To test the Pi Network integration:

1. Make sure your Vercel deployment is successful
2. Verify that all endpoints are accessible:
   - `https://your-app.vercel.app/api/metadata`
   - `https://your-app.vercel.app/api/pi?action=price`
   - `https://your-app.vercel.app/api/pi?action=balance`
3. Test the payment flow using the Pi Testnet browser

## Troubleshooting

If you encounter issues:

1. Check that the API key is correctly configured
2. Verify that the endpoints are returning the correct data
3. Ensure that CORS headers are properly set
4. Confirm that the Pi Network Testnet environment is correctly configured
