# Pi Network API Endpoints

All backend calls for Pi Network transactions and functionality are now handled by a single consolidated endpoint:

**Base URL:** https://b4uesports.vercel.app/api/pi

## Available Actions

### 1. Price
- **Endpoint:** `GET /api/pi?action=price`
- **Description:** Returns the current Pi price
- **Response:** `{ "price": 0.26 }`

### 2. Balance
- **Endpoint:** `GET /api/pi?action=balance`
- **Description:** Returns mock Pi balance for testnet
- **Response:** `{ "balance": 1000.0 }`

### 3. Authentication
- **Endpoint:** `POST /api/pi?action=auth`
- **Description:** Handles Pi Network authentication
- **Request Body:** User data object
- **Response:** `{ "success": true, "user": {} }`

### 4. Create Payment
- **Endpoint:** `POST /api/pi?action=create-payment`
- **Description:** Creates a new Pi payment
- **Request Body:**
  ```json
  {
    "amount": 10,
    "memo": "B4U Esports Test Payment",
    "metadata": { "orderId": "123" }
  }
  ```
- **Response:** Pi Network API response

### 5. Approve Payment
- **Endpoint:** `POST /api/pi?action=approve-payment`
- **Description:** Approves a Pi payment
- **Request Body:**
  ```json
  {
    "paymentId": "payment-123"
  }
  ```
- **Response:** Pi Network API response

### 6. Complete Payment
- **Endpoint:** `POST /api/pi?action=complete-payment`
- **Description:** Completes a Pi payment
- **Request Body:**
  ```json
  {
    "paymentId": "payment-123",
    "txid": "transaction-id"
  }
  ```
- **Response:** Pi Network API response

### 7. User Profile
- **Endpoint:** `GET /api/pi?action=user`
- **Description:** Returns user profile data
- **Response:** Mock user data

### 8. Webhook
- **Endpoint:** `POST /api/pi?action=webhook`
- **Description:** Handles Pi Network webhooks
- **Request Body:** Webhook data from Pi Network
- **Response:** `{ "success": true }`

## How It Works

All Pi Network functionality is consolidated into a single file: `/api/pi.js`

The endpoint uses query parameters to determine which action to perform:
- `/api/pi?action=price` → Returns Pi price
- `/api/pi?action=balance` → Returns mock balance
- `/api/pi?action=auth` → Handles authentication
- `/api/pi?action=create-payment` → Creates payments
- `/api/pi?action=approve-payment` → Approves payments
- `/api/pi?action=complete-payment` → Completes payments
- `/api/pi?action=user` → Returns user data
- `/api/pi?action=webhook` → Handles webhooks

This approach:
1. Reduces the number of Vercel functions (avoids 12-function limit)
2. Centralizes all Pi Network functionality
3. Maintains all necessary features for the B4U Esports application
4. Uses Testnet mode with hardcoded API key for consistency