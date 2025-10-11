# B4U Esports

B4U Esports is a gaming platform that allows users to purchase in-game currency for popular games like PUBG and Mobile Legends: Bang Bang using Pi Network cryptocurrency.

## Features

- User authentication with Pi Network
- Purchase in-game currency with Pi coins
- Real-time Pi price tracking
- Email notifications for successful purchases
- Admin dashboard for managing packages and transactions

## Technologies Used

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL (with Drizzle ORM)
- Payment Processing: Pi Network SDK
- Deployment: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`

## Environment Variables

- `PI_SERVER_API_KEY`: Pi Network server API key
- `JWT_SECRET`: Secret for JWT token signing
- `DATABASE_URL`: PostgreSQL database connection string
- `EMAILJS_SERVICE_ID`: EmailJS service ID for email notifications
- `EMAILJS_TEMPLATE_ID`: EmailJS template ID for email notifications
- `EMAILJS_PUBLIC_KEY`: EmailJS public key for email notifications

## Pi Network Testnet Integration

This application fully supports Pi Network Testnet for development and testing purposes. For detailed information on how to configure and use Testnet mode, please refer to our comprehensive guide:

[Pi Network Testnet Integration Guide](PI_NETWORK_TESTNET_GUIDE.md)

### Quick Testnet Setup

To enable Testnet mode, set the following environment variables:

```env
# Enable Testnet mode
PI_SANDBOX=true

# Pi Network Server API Key (from Pi Developer Portal Testnet section)
PI_SERVER_API_KEY=your_testnet_api_key_here
```

### Key Benefits of Testnet Mode

- Test payment flows without using real Pi coins
- Safe environment for development and debugging
- Full feature parity with Mainnet
- No financial risk during testing

## Force rebuild by adding a comment
Updated vercel.json configuration
Updated package.json to use .cjs extension

# B4U Esports - Pi Network Marketplace

This is a gaming currency marketplace built with Pi Network integration, allowing users to purchase PUBG UC and Mobile Legends Diamonds using Pi coins.

## Features

- Pi Network Testnet integration for secure payments
- Real-time Pi/USD pricing from CoinGecko API
- Support for PUBG Mobile UC and Mobile Legends Diamonds purchases
- Responsive design for all devices
- Admin dashboard for managing packages and transactions
- Email notifications for purchase confirmations

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express
- Database: Supabase
- Authentication: Pi Network SDK
- Deployment: Vercel
- Styling: Tailwind CSS + Shadcn UI

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Pi Network
VITE_PI_API_KEY=your_pi_server_api_key
PI_SERVER_API_KEY=your_pi_server_api_key

# Pi Network Sandbox Mode
VITE_PI_SANDBOX=true
PI_SANDBOX=true

# Email Service
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Database
DATABASE_URL=your_supabase_connection_string

# Security
JWT_SECRET=your_jwt_secret

# APIs
COINGECKO_API_KEY=your_coingecko_api_key
```

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

## Deployment

### Vercel Deployment (Recommended)

This application is deployed on Vercel with automatic framework detection.

### GitHub Pages Deployment

To deploy to GitHub Pages:

1. Deploy the backend server to a hosting service that supports Node.js (e.g., Render, Heroku, or Vercel)
2. Set the `VITE_API_URL` environment variable to the URL of your deployed backend
3. Build the frontend: `npm run build`
4. Deploy the contents of the `dist` directory to GitHub Pages

Note: GitHub Pages is a static hosting service and cannot run server-side code. The backend must be deployed separately.

## Recent Updates

- Fixed Vercel deployment configuration to allow automatic framework detection
- Resolved TypeScript compilation errors
- Fixed module import issues for ESBuild bundling
- Improved static asset routing

## License

MIT

# B4U Esports - Pi Network Gaming Marketplace

## Overview

B4U Esports is a comprehensive gaming marketplace that integrates Pi Network cryptocurrency for purchasing in-game currencies. The platform allows users to buy PUBG Mobile UC and Mobile Legends: Bang Bang Diamonds using Pi coins through a secure, real-time payment system.

## Features

- Pi Network Testnet integration for secure payments
- Real-time Pi/USD pricing from CoinGecko API
- Support for PUBG Mobile UC and Mobile Legends Diamonds purchases
- Responsive design for all devices
- Admin dashboard for managing packages and transactions
- Email notifications for purchase confirmations
- Comprehensive error handling and user feedback

## Technologies Used

- Frontend: React, TypeScript, Tailwind CSS, Vite
- Backend: Node.js, Express
- Database: PostgreSQL (with Drizzle ORM)
- Payment Processing: Pi Network SDK
- Deployment: Vercel

## Pi Network Integration

This application integrates with Pi Network to enable cryptocurrency payments for gaming currency purchases. The integration supports both Testnet (development) and Mainnet (production) environments.

### Key Components

1. **Frontend Integration**
   - Dynamic Pi SDK loading and initialization
   - User authentication with Pi Network
   - Payment initiation and user interaction
   - Incomplete payment handling

2. **Backend Integration**
   - Access token verification with Pi Network API
   - Server-side payment approval and completion
   - Transaction record management
   - Email notifications

### Environment Configuration

The application uses the following environment variables for Pi Network integration:

```env
# Pi Network Server API Key (required for payment processing)
VITE_PI_API_KEY=cszew9tw3qa1re4visdjd72jt38qy475fugolvqxikfr6xdclngdshajvmunurc9
PI_API_KEY=cszew9tw3qa1re4visdjd72jt38qy475fugolvqxikfr6xdclngdshajvmunurc9

# Pi Network Sandbox Mode
# true = Testnet (development)
# false = Mainnet (production)
VITE_PI_SANDBOX=true
PI_SANDBOX=true

# JWT Secret for authentication
JWT_SECRET=your_secure_jwt_secret
```

### Testnet vs Mainnet

- **Testnet (Sandbox: true)**: Uses `https://sandbox.minepi.com/v2` endpoints for safe testing
- **Mainnet (Sandbox: false)**: Uses `https://api.minepi.com/v2` endpoints for real transactions

### Payment Flow

The payment flow follows Pi Network's recommended approach with server-side approval:

1. Client initiates payment using `Pi.createPayment` method
2. Pi Network calls `onReadyForServerApproval` callback with a paymentId
3. Client sends paymentId to server for approval
4. Server approves payment by calling Pi Network API endpoint `/payments/{payment_id}/approve`
5. Pi Network processes the blockchain transaction
6. Pi Network calls `onReadyForServerCompletion` callback with transaction details
7. Server completes the payment process and user receives confirmation

### Wallet Address

All payments are sent to the app's wallet address: `GA67F4RLREQP6KLEVMTBJDHKDWOGNX5DBKKGDNHR5S6QAALISFL3LEDZ`

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Pi Network
VITE_PI_API_KEY=cszew9tw3qa1re4visdjd72jt38qy475fugolvqxikfr6xdclngdshajvmunurc9
PI_SERVER_API_KEY=cszew9tw3qa1re4visdjd72jt38qy475fugolvqxikfr6xdclngdshajvmunurc9

# Pi Network Sandbox Mode
VITE_PI_SANDBOX=true
PI_SANDBOX=true

# Security
JWT_SECRET=your_jwt_secret

# Email Service
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Database
DATABASE_URL=your_supabase_connection_string

# APIs
COINGECKO_API_KEY=your_coingecko_api_key
```

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

## Deployment

### Vercel Deployment (Recommended)

This application is deployed on Vercel with automatic framework detection.

### GitHub Pages Deployment

To deploy to GitHub Pages:

1. Deploy the backend server to a hosting service that supports Node.js (e.g., Render, Heroku, or Vercel)
2. Set the `VITE_API_URL` environment variable to the URL of your deployed backend
3. Build the frontend: `npm run build`
4. Deploy the contents of the `dist` directory to GitHub Pages

Note: GitHub Pages is a static hosting service and cannot run server-side code. The backend must be deployed separately.

## Recent Updates

- Fixed Vercel deployment configuration to allow automatic framework detection
- Resolved TypeScript compilation errors
- Fixed module import issues for ESBuild bundling
- Improved static asset routing
- Enhanced Pi Network Testnet integration with proper sandbox mode handling

## License

MIT

# B4U Esports Pi Network Marketplace

## Environment Setup

### Local Development

1. Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Create a `client/.env` file based on `client/.env.example`:
   ```bash
   cp client/.env.example client/.env
   ```

3. Update the environment variables in both files with your actual values.

### Vercel Deployment

For Vercel deployment, the following environment variables should be set in the Vercel dashboard:

- `NODE_ENV=production`
- `FRONTEND_URL=https://b4uesports.vercel.app`
- `API_URL=https://b4uesports.vercel.app`
- `PI_SERVER_API_KEY=your_pi_api_key_here`
- `PI_SANDBOX=true` (for Testnet)
- `JWT_SECRET=your_jwt_secret_here`
- `SUPABASE_URL=your_supabase_url_here`
- `SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here`

## Development

To run the development server:

```bash
npm run dev
```

The server will start on port 5000 by default.

## Deployment

This application is configured for deployment on Vercel. The `vercel.json` file contains the necessary configuration for proper deployment.

## Troubleshooting

### Authentication Issues

If you're experiencing authentication issues:

1. Make sure you're using the Pi Browser app
2. Ensure the `PI_SERVER_API_KEY` is correctly set
3. Check that `PI_SANDBOX` is set to `true` for Testnet
4. Verify that the JWT secret is properly configured

### CORS Issues

If you encounter CORS errors:

1. Check that `FRONTEND_URL` is correctly set
2. Ensure the frontend and backend URLs match in your environment configuration
3. For local development, the CORS policy is permissive (`*`)
4. For production/Vercel, CORS is restricted to the `FRONTEND_URL`

### API Connection Issues

If the frontend cannot connect to the backend:

1. For local development, ensure `VITE_API_URL` is set in `client/.env`
2. For Vercel deployment, relative URLs are used as the frontend and backend are on the same domain
