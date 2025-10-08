# Pi Network Testnet Integration Testing Guide

This guide provides instructions for thoroughly testing the Pi Network integration using the Testnet environment.

## Prerequisites

1. **Pi Browser**: Install the Pi Browser app on your mobile device
2. **Test-Pi Wallet**: Ensure you have Test-Pi tokens in your wallet
3. **Sandbox Environment**: The application is configured to use Testnet by default

## Testing Environment Configuration

The application is already configured for Testnet testing:

- Pi SDK is initialized with `version: "2.0"` and `sandbox: true`
- All API calls are directed to `https://sandbox.minepi.com`
- Server-side operations use the Testnet environment

## Test Scenarios

### 1. Authentication Flow

**Test Steps:**
1. Open the application in the Pi Browser
2. Click on "Sign in with Pi Network"
3. Approve the authentication request in the Pi Browser
4. Verify that you're successfully logged in

**Expected Results:**
- User is authenticated with Pi Network
- User profile is created/updated in the database
- JWT token is generated for session management

### 2. Payment Flow

**Test Steps:**
1. Select a package to purchase
2. Click "Buy with Pi"
3. Review payment details in the Pi Browser
4. Confirm the transaction
5. Wait for server-side approval and completion

**Expected Results:**
- Payment is created successfully
- Server receives `onReadyForServerApproval` callback
- Server approves payment with Pi Network API
- Server receives `onReadyForServerCompletion` callback
- Server completes payment with Pi Network API
- Transaction is recorded in the database
- Confirmation email is sent (if email is provided)

### 3. Incomplete Payment Handling

**Test Steps:**
1. Start a payment but don't complete it
2. Close the app or cancel the transaction
3. Re-authenticate with the app
4. Observe the incomplete payment handling

**Expected Results:**
- `onIncompletePaymentFound` callback is triggered
- System prompts user to complete the previous payment
- Previous payment can be completed successfully

### 4. Error Handling

**Test Steps:**
1. Attempt authentication without Pi Browser
2. Try to make a payment with insufficient funds
3. Cancel a payment during the process
4. Simulate network errors during payment processing

**Expected Results:**
- Appropriate error messages are displayed
- User is guided on how to resolve issues
- System state remains consistent

## Testing Checklist

### Authentication Testing
- [ ] Pi SDK loads correctly in Pi Browser
- [ ] Authentication request appears in Pi Browser
- [ ] User can approve authentication
- [ ] Backend verification works correctly
- [ ] User profile is created in database
- [ ] Session token is generated and stored

### Payment Testing
- [ ] Payment creation works correctly
- [ ] Payment details are displayed correctly in Pi Browser
- [ ] User can confirm payment
- [ ] Server receives approval callback
- [ ] Server approves payment with Pi API
- [ ] Server receives completion callback
- [ ] Server completes payment with Pi API
- [ ] Transaction is recorded in database
- [ ] Confirmation email is sent (if applicable)

### Incomplete Payment Testing
- [ ] Incomplete payment is detected on re-authentication
- [ ] User is notified of incomplete payment
- [ ] System can complete previous payment
- [ ] Previous payment is marked as completed

### Error Handling Testing
- [ ] Authentication timeout is handled correctly
- [ ] Payment cancellation is handled correctly
- [ ] Network errors are handled gracefully
- [ ] Invalid tokens are rejected appropriately
- [ ] User-friendly error messages are displayed

## Debugging Tips

1. **Check Browser Console**: Look for any JavaScript errors in the Pi Browser's developer console
2. **Monitor Network Requests**: Verify that API calls are being made to the correct endpoints
3. **Check Server Logs**: Review Vercel function logs for any backend errors
4. **Verify Testnet Configuration**: Ensure all API calls are directed to `sandbox.minepi.com`

## Common Issues and Solutions

### Authentication Issues
- **Problem**: Authentication request doesn't appear in Pi Browser
- **Solution**: Ensure you're using the Pi Browser and that the Pi SDK is loaded correctly

### Payment Issues
- **Problem**: Payment fails with insufficient funds
- **Solution**: Add more Test-Pi to your wallet using the Pi Testnet faucet

### Timeout Issues
- **Problem**: Authentication or payment times out
- **Solution**: Increase timeout values and ensure good network connectivity

## Test Data

Use the following test packages for consistent testing:

1. **Small Package**: 1.50 π (Test purchase)
2. **Medium Package**: 6.50 π (Standard purchase)
3. **Large Package**: 12.00 π (Premium purchase)

## Verification Points

After each test, verify the following:

1. **Database Records**: Check that transactions are properly recorded
2. **Pi Network Status**: Verify payment status in Pi Network dashboard
3. **Email Notifications**: Confirm that emails are sent (if applicable)
4. **User Interface**: Ensure UI updates correctly after each operation

## Reporting Issues

If you encounter any issues during testing:

1. Document the exact steps taken
2. Capture any error messages
3. Note the device and browser used
4. Include relevant logs from browser console and server
5. Report to the development team with detailed information

This comprehensive testing approach will ensure that the Pi Network integration works correctly in the Testnet environment before moving to Mainnet.