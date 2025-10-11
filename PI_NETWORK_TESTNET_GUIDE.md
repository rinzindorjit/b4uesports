# Pi Network Testnet Integration Guide

This guide explains how to properly configure and use the Pi Network Testnet integration in the B4U Esports application.

## Overview

The B4U Esports application supports both Pi Network Mainnet and Testnet environments. Testnet is used for development and testing purposes, allowing developers to test payment flows without using real Pi coins.

## Configuration

### Environment Variables

To enable Testnet mode, set the following environment variables:

```bash
# Enable Testnet mode
PI_SANDBOX=true

# Pi Network Server API Key (from Pi Developer Portal Testnet section)
PI_SERVER_API_KEY=your_testnet_api_key_here

# Pi Network API Key (alternative)
PI_API_KEY=your_testnet_api_key_here
```

### Vercel Configuration

When deploying to Vercel, make sure to set these environment variables in the Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - `PI_SANDBOX` = `true`
   - `PI_SERVER_API_KEY` = `your_testnet_api_key_here`

## Payment Flow Implementation

### Frontend (Client-side)

The frontend implementation uses the Pi SDK with proper sandbox mode configuration:

1. **Pi SDK Initialization**
   ```javascript
   // Initialize Pi SDK with sandbox mode for Testnet
   window.Pi.init({
     version: "2.0",
     sandbox: true  // Enable Testnet mode
   });
   ```

2. **Authentication**
   ```javascript
   // Authenticate with required scopes
   const authResult = await window.Pi.authenticate(
     ['payments', 'username', 'wallet_address'],
     onIncompletePaymentFound
   );
   ```

3. **Payment Creation**
   ```javascript
   // Create payment with proper callbacks
   window.Pi.createPayment(paymentData, {
     onReadyForServerApproval: (paymentId) => {
       // Send paymentId to backend for approval
     },
     onReadyForServerCompletion: (paymentId, txid) => {
       // Send txid to backend for completion
     },
     onCancel: (paymentId) => {
       // Handle payment cancellation
     },
     onError: (error, payment) => {
       // Handle payment errors
     }
   });
   ```

### Backend (Server-side)

The backend handles payment approval and completion through the Pi Network API:

1. **Payment Approval**
   ```javascript
   // Approve payment using Pi Network API
   const response = await fetch(`${PI_SERVER_URL}/payments/${paymentId}/approve`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "Authorization": `Key ${PI_API_KEY}`
     },
     body: JSON.stringify({})
   });
   ```

2. **Payment Completion**
   ```javascript
   // Complete payment using Pi Network API
   const response = await fetch(`${PI_SERVER_URL}/payments/${paymentId}/complete`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
       "Authorization": `Key ${PI_API_KEY}`
     },
     body: JSON.stringify({ txid })
   });
   ```

## Testing Process

### 1. Setup Testnet Environment

1. Obtain a Testnet API key from the Pi Developer Portal
2. Set `PI_SANDBOX=true` in your environment
3. Use the Testnet API key in `PI_SERVER_API_KEY`

### 2. Test Payment Flow

1. Open the application in the Pi Browser
2. Authenticate with Testnet mode enabled
3. Initiate a payment
4. Approve the payment in the Pi Browser
5. Verify the payment is processed correctly

### 3. Verify Testnet Transactions

Testnet transactions will show:
- "TESTNET TRANSACTION" in the UI
- No real Pi coins deducted
- Proper logging in the console

## Best Practices

### Security

1. Never expose `PI_SERVER_API_KEY` in client-side code
2. Always validate payment data on the server
3. Use HTTPS for all API communications

### Error Handling

1. Implement proper error handling for all Pi Network API calls
2. Handle incomplete payments using the `onIncompletePaymentFound` callback
3. Provide clear error messages to users

### Testing

1. Test all payment scenarios in Testnet before moving to Mainnet
2. Verify proper handling of edge cases (cancellations, timeouts, etc.)
3. Monitor logs for any errors or warnings

## Troubleshooting

### Common Issues

1. **"Unexpected token 'export'" Error**
   - Ensure `PI_SANDBOX` is set to `true`
   - Verify the correct API key is being used

2. **Authentication Failures**
   - Make sure you're using the Pi Browser
   - Check that the Testnet API key is correct

3. **Payment Processing Issues**
   - Verify the payment ID format
   - Check network connectivity to Pi Network servers

### Debugging

1. Enable debug logging by checking console output
2. Verify environment variables are set correctly
3. Check Pi Network API response codes and messages

## Additional Resources

- [Pi Network Developer Documentation](https://developers.minepi.com)
- [Pi Network Testnet Documentation](https://docs.minepi.com/testnet)
- [Pi SDK Reference](https://github.com/pi-apps/pi-platform-docs)