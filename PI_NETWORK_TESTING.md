# Pi Network Integration Testing Guide

## Overview
This document provides instructions for testing the Pi Network integration in the B4U Esports application.

## Test Endpoints

### 1. Payment Creation
- **Endpoint**: `/api/pi/create-payment`
- **Method**: POST
- **Purpose**: Create a new payment with Pi Network

### 2. Payment Approval
- **Endpoint**: `/api/payment/approve`
- **Method**: POST
- **Purpose**: Approve a payment that has been created

### 3. Payment Completion
- **Endpoint**: `/api/payment/complete`
- **Method**: POST
- **Purpose**: Complete a payment after it has been approved

### 4. Authentication
- **Endpoint**: `/api/pi/auth`
- **Method**: POST
- **Purpose**: Authenticate a user with Pi Network

## Diagnostic Endpoints

### 1. Comprehensive Pi Network Test
- **Endpoint**: `/api/comprehensive-pi-test`
- **Method**: POST
- **Purpose**: Run a comprehensive test of all Pi Network API interactions

### 2. Endpoint Testing
- **Endpoint**: `/api/test-pi-endpoints`
- **Method**: POST
- **Purpose**: Test different Pi Network API endpoints to identify which one works

### 3. DNS and Connectivity Test
- **Endpoint**: `/api/test-pi-dns`
- **Method**: GET
- **Purpose**: Test DNS resolution and connectivity to Pi Network

## Testing with the Web Interface

1. Visit `https://b4uesports.vercel.app/pi-test.html`
2. Click on the "Create Payment" button to test payment creation
3. Click on "Run Comprehensive Test" to run all tests
4. Click on "Test Different Endpoints" to test various Pi Network endpoints

## Environment Variables

The application uses the following environment variables:

- `PI_SERVER_API_KEY`: Your Pi Network server API key
- `PI_SANDBOX_MODE`: Set to "true" for sandbox mode
- `NODE_ENV`: Set to "development" for development mode

If these are not set, the application will use hardcoded values for testing.

## Troubleshooting

### 403 Forbidden Error
If you encounter a 403 error with the message "This distribution is not configured to allow the HTTP request method that was used for this request. The distribution supports only cachable requests.", this indicates that the request is hitting Pi Network's CDN instead of their API server.

### Solutions:
1. Ensure you're using the correct endpoint: `https://sandbox.minepi.com/v2/payments`
2. Verify that you're using the correct API key
3. Check that you're sending the proper headers:
   - `Authorization: Key YOUR_API_KEY`
   - `Content-Type: application/json`
   - `User-Agent: B4U-Esports-Server/1.0`

### Debugging Information
The application logs detailed debugging information to the console, including:
- API key being used
- Request headers
- Response headers
- Response content
- CDN detection information

## Contact
For issues with the Pi Network integration, please contact the development team.