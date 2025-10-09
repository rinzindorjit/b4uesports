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

## Deployment to Vercel

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. The following environment variables configured in your Vercel project:

### Environment Variables

Create these environment variables in your Vercel project settings:

| Variable Name | Description | Required |
|---------------|-------------|----------|
| `PI_SERVER_API_KEY` | Pi Network Server API Key | ✅ |
| `EMAILJS_SERVICE_ID` | EmailJS Service ID for email notifications | ✅ |
| `EMAILJS_TEMPLATE_ID` | EmailJS Template ID | ✅ |
| `EMAILJS_PUBLIC_KEY` | EmailJS Public Key | ✅ |
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `DATABASE_URL` | PostgreSQL database connection string | ✅ |
| `JWT_SECRET` | Secret for JWT token generation | ✅ |
| `COINGECKO_API_KEY` | CoinGecko API Key for Pi price fetching | Not Required |

### Deployment Steps

1. Fork this repository to your GitHub account
2. Log in to your Vercel account
3. Click "New Project" and import your forked repository
4. Configure the project settings:
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add the required environment variables in the "Environment Variables" section
6. Click "Deploy"

### API Endpoint Limit

This project is optimized for Vercel's free tier with only 6 API endpoints, well below the 12 endpoint limit:

1. `POST /api/users` - User authentication and profile management
2. `GET /api/packages` - Retrieve available gaming packages
3. `GET /api/pi-price` - Get current Pi/USD price
4. `POST /api/payments` - Payment approval and completion
5. `GET /api/transactions` - User transaction history
6. Static file serving

### Testnet Mode

The application is configured to run exclusively on Pi Network Testnet for safe testing of payment flows. No real Pi coins are deducted during transactions.

## Development

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Pi Network Developer account

### Local Development

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd b4uesports
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration values

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5000](http://localhost:5000) in your browser

## Project Structure

```
b4uesports/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── vercel.json      # Vercel configuration
└── package.json     # Project dependencies and scripts
```

## Security

- All API keys are stored as environment variables
- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Pi Network transactions use server-side approval and completion
- HTTPS is enforced in production

## Support

For support, contact:
- Email: info@b4uesports.com
- Phone: +97517875099

© 2025 B4U Esports. All Rights Reserved.