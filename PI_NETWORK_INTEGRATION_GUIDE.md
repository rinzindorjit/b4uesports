# Pi Network Integration Guide

This guide provides comprehensive instructions for integrating Pi Network payments into your application, covering both Testnet (development) and Mainnet (production) environments.

## Table of Contents
1. [Overview](#overview)
2. [Environment Configuration](#environment-configuration)
3. [Frontend Integration](#frontend-integration)
4. [Backend Integration](#backend-integration)
5. [Payment Flow](#payment-flow)
6. [Testing](#testing)
7. [Deployment](#deployment)

## Overview

The B4U Esports marketplace integrates with Pi Network to enable seamless cryptocurrency payments. The integration follows Pi Network's recommended architecture with proper separation of concerns between frontend and backend components.

### Key Components

1. **Frontend (Client-side)**
   - Pi SDK initialization and authentication
   - Payment initiation and user interaction
   - Handling of incomplete payments

2. **Backend (Server-side)**
   - Access token verification
   - Server-side payment approval and completion
   - Transaction record management
   - Email notifications

## Environment Configuration

### Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Pi Network Server API Key (required)
PI_SERVER_API_KEY=your_actual_pi_server_api_key

# Pi Network Sandbox Mode
# true = Testnet (development)
# false = Mainnet (production)
PI_SANDBOX=true

# JWT Secret for authentication
JWT_SECRET=your_secure_jwt_secret

# EmailJS Configuration (for purchase notifications)
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

### Testnet vs Mainnet

The application automatically switches between Testnet and Mainnet based on the `PI_SANDBOX` environment variable:

- **Testnet (Sandbox: true)**: Uses `https://sandbox.minepi.com/v2` endpoints
  - No real Pi coins are transferred
  - Ideal for development and testing
  - Use Pi Testnet tokens from the Pi Browser faucet

- **Mainnet (Sandbox: false)**: Uses `https://api.minepi.com/v2` endpoints
  - Real Pi coin transactions
  - Production environment
  - Requires proper Pi Network merchant account

## Frontend Integration

### Pi SDK Initialization

The Pi SDK is dynamically loaded and initialized with the appropriate sandbox setting:

```javascript
// client/src/lib/pi-sdk.ts
window.Pi.init({ 
  version: "2.0", 
  sandbox: process.env.NODE_ENV !== 'production' // true in development, false in production
});
```

### Authentication Flow

1. **Initialize Pi SDK**
2. **Call authenticate() with required scopes**
3. **Handle incomplete payments callback**
4. **Send access token to backend for verification**

```javascript
// client/src/hooks/use-pi-network.tsx
const authResult = await window.Pi.authenticate(
  ['payments', 'username', 'wallet_address'], 
  onIncompletePaymentFound
);

// Send access token to backend
const response = await apiRequest('POST', '/api/users', {
  action: 'authenticate',
  data: { accessToken: authResult.accessToken }
});
```

### Payment Flow

1. **Create payment data with amount, memo, and metadata**
2. **Call createPayment() with callbacks**
3. **Handle server-side approval and completion**

```javascript
// client/src/components/purchase-modal.tsx
const paymentData = {
  amount: pkg.piPrice,
  memo: `${pkg.name} for ${pkg.game}`,
  metadata: {
    type: 'backend',
    userId: user.id,
    packageId: pkg.id,
    gameAccount: { ...gameAccount }
  }
};

piSDK.createPayment(paymentData, {
  onReadyForServerApproval: (paymentId) => {
    // Notify backend to approve payment
  },
  onReadyForServerCompletion: (paymentId, txid) => {
    // Notify backend to complete payment
  },
  onCancel: (paymentId) => {
    // Handle cancellation
  },
  onError: (error) => {
    // Handle errors
  }
});
```

## Backend Integration

### Access Token Verification

The backend verifies the access token received from the frontend:

```javascript
// server/services/pi-network.ts
const res = await axios.get(`${PI_API_BASE_URL}/me`, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  }
});
```

### Server-Side Payment Approval

When the frontend notifies the backend that a payment is ready for approval:

```javascript
// server/routes.ts
const approved = await piNetworkService.approvePayment(
  data.paymentId, 
  PI_SERVER_API_KEY
);
```

### Server-Side Payment Completion

When the frontend notifies the backend that a payment is ready for completion:

```javascript
// server/routes.ts
const completed = await piNetworkService.completePayment(
  data.paymentId, 
  data.txid, 
  PI_SERVER_API_KEY
);
```

## Payment Flow

### 1. Authentication

```
[Frontend]            [Backend]            [Pi Network]
    |                    |                    |
    |--- authenticate() ---------------------->|
    |                    |                    |
    |<-- access token ---|                    |
    |                    |                    |
    |-- POST /api/users -->|                  |
    |                    |---- verify token -->|
    |                    |<--- user data -----|
    |<-- JWT token ------|                    |
```

### 2. Payment Creation

```
[Frontend]            [Backend]            [Pi Network]
    |                    |                    |
    |--- createPayment() -------------------->|
    |                    |                    |
    |<-- paymentId ------|                    |
    |                    |                    |
    |-- POST /api/payments -->|              |
    |   (action: approve)   |                |
    |                    |-- approve payment ->|
    |                    |<-- success --------|
    |<-- approval done ---|                  |
```

### 3. Payment Completion

```
[Frontend]            [Backend]            [Pi Network]
    |                    |                    |
    |<-- txid -----------|                    |
    |                    |                    |
    |-- POST /api/payments -->|              |
    |   (action: complete)  |                |
    |                    |-- complete payment->|
    |                    |<-- success --------|
    |<-- completion done --|                  |
```

## Testing

### Testnet Testing Process

1. **Install Pi Browser** on your mobile device
2. **Access your development URL** through Pi Browser
3. **Use Test-Pi tokens** from the Pi Browser faucet
4. **Test authentication flow**
5. **Test payment flow** with various packages
6. **Verify email notifications**
7. **Test incomplete payment handling**

### Common Test Scenarios

1. **Successful Authentication**
   - User opens app in Pi Browser
   - Clicks "Sign in with Pi Network"
   - Approves authentication in Pi Browser
   - Receives success confirmation

2. **Successful Payment**
   - User selects a package
   - Enters game account information
   - Enters passphrase
   - Confirms payment in Pi Browser
   - Receives payment confirmation
   - Receives email notification

3. **Incomplete Payment Handling**
   - User starts a payment but doesn't complete it
   - User returns to app later
   - System detects incomplete payment
   - Prompts user to complete previous payment

4. **Error Handling**
   - Network errors
   - Authentication timeouts
   - Payment cancellations
   - Invalid tokens

### Debugging Tips

1. **Check Browser Console** for JavaScript errors
2. **Monitor Network Requests** to verify API calls
3. **Check Server Logs** for backend errors
4. **Verify Testnet Configuration** in environment variables

## Deployment

### Vercel Deployment

1. **Set Environment Variables** in Vercel dashboard:
   - `PI_SERVER_API_KEY`
   - `PI_SANDBOX`
   - `JWT_SECRET`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
   - `EMAILJS_PUBLIC_KEY`

2. **Configure Build Settings**:
   - Build Command: `npm run build-deploy`
   - Output Directory: `dist`

3. **Domain Configuration**:
   - Ensure your domain is verified in Pi Developer Portal
   - Configure proper redirect URLs

### Mainnet Migration

To migrate from Testnet to Mainnet:

1. **Update Environment Variables**:
   ```
   PI_SANDBOX=false
   ```

2. **Verify Pi Network Merchant Account**:
   - Ensure your app is approved for Mainnet
   - Verify your Server API Key

3. **Test Thoroughly**:
   - Small transactions first
   - Verify all payment flows
   - Check email notifications

4. **Monitor Transactions**:
   - Watch for errors
   - Verify successful completions
   - Check user feedback

## Security Best Practices

1. **Never expose Server API Key** to frontend
2. **Always verify access tokens** on backend
3. **Use HTTPS** for all communications
4. **Validate all user inputs**
5. **Hash sensitive data** like passphrases
6. **Implement proper error handling**
7. **Log security-relevant events**

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure you're using Pi Browser
   - Check network connectivity
   - Verify Pi SDK is loaded correctly

2. **Payment Errors**
   - Check Server API Key configuration
   - Verify sandbox mode settings
   - Ensure proper callback handling

3. **Email Notification Issues**
   - Verify EmailJS configuration
   - Check email template parameters
   - Test email service independently

### Support

For issues with the Pi Network integration:
1. Check Pi Network developer documentation
2. Review application logs
3. Contact Pi Network support if needed