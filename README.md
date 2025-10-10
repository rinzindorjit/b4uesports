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
PI_SERVER_API_KEY=your_pi_server_api_key

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
PI_SERVER_API_KEY=your_pi_server_api_key

# Pi Network Sandbox Mode
# true = Testnet (development)
# false = Mainnet (production)
PI_SANDBOX=true

# JWT Secret for authentication
JWT_SECRET=your_secure_jwt_secret
```

### Testnet vs Mainnet

- **Testnet (Sandbox: true)**: Uses `https://sandbox.minepi.com/v2` endpoints for safe testing
- **Mainnet (Sandbox: false)**: Uses `https://api.minepi.com/v2` endpoints for real transactions

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run the development server: `npm run dev`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Pi Network
PI_SERVER_API_KEY=your_pi_server_api_key
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