# B4U Esports - Pi Network Gaming Marketplace

This is the official repository for B4U Esports, a gaming marketplace that allows users to purchase PUBG UC and Mobile Legends Diamonds using Pi coins.

## Features

- Pi Network integration for secure payments
- Support for PUBG and Mobile Legends top-ups
- User authentication and profile management
- Transaction history tracking
- Admin dashboard for managing packages and transactions

## Deployment Status

Last updated: September 24, 2025

## API Endpoints

- `/api/auth/pi` - Authenticate with Pi Network
- `/api/packages` - Get available top-up packages
- `/api/transactions` - Get transaction history
- `/api/payment/approve` - Approve Pi payment
- `/api/payment/complete` - Complete Pi payment

## Environment Variables

Make sure to set the following environment variables:

- `PI_API_KEY` - Pi Network API key
- `PI_SECRET_KEY` - Pi Network secret key
- `JWT_SECRET` - Secret for JWT token generation
- `DATABASE_URL` - Connection string for the database

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables
4. Run the development server with `npm run dev`

## Building for Production

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Deployment

This application is deployed on Vercel. The deployment is configured through `vercel.json`.

## Recent Changes

- Fixed Vercel deployment configuration
- Removed conflicting root index.html file
- Set outputDirectory to "dist" in vercel.json