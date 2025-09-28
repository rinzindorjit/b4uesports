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

This project is optimized for Vercel's free tier with only 7 API endpoints, well below the 12 endpoint limit:

1. `POST /api/users` - User authentication and profile management
2. `GET /api/packages` - Retrieve available gaming packages
3. `GET /api/pi-price` - Get current Pi/USD price
4. `POST /api/payments` - Payment approval and completion
5. `GET /api/transactions` - User transaction history
6. `POST /api/admin` - Admin operations
7. Static file serving

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