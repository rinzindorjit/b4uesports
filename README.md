# B4U Esports - Pi Network Gaming Marketplace

This is the official repository for B4U Esports, a gaming marketplace that allows users to purchase PUBG UC and Mobile Legends Diamonds using Pi coins.

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Recent Improvements](#recent-improvements)

## Project Overview

B4U Esports is a Pi Network integrated marketplace that allows users to purchase in-game currency for popular mobile games using Pi coins. The platform provides a secure and seamless payment experience integrated with Pi Network's payment system.

## Technology Stack

- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (via Drizzle ORM)
- **Deployment**: Vercel
- **State Management**: React Context API
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: Radix UI, Shadcn UI

## Project Structure

```
B4U Esports/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and SDK wrappers
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript type definitions
│   │   └── App.tsx         # Main application component
│   └── index.html          # Frontend entry point
├── server/                 # Backend Express server
│   ├── api/                # API route handlers
│   ├── db/                 # Database schema and migrations
│   └── index.ts            # Server entry point
├── public/                 # Static assets
├── dist/                   # Build output directory
├── .env                    # Environment variables
├── package.json            # Project dependencies and scripts
└── vercel.json             # Vercel deployment configuration
```

## Environment Setup

### Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# EmailJS Configuration
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_ADMIN_TEMPLATE_ID=your_admin_template_id
EMAILJS_PUBLIC_KEY=your_public_key
ADMIN_EMAIL=admin@b4uesports.com

# Database (PostgreSQL connection string)
DATABASE_URL=your_database_url

# JWT (For token generation)
JWT_SECRET=your_jwt_secret

# Node Environment
NODE_ENV=development
```

Note: For Vercel deployments, Pi Network integration works in Testnet mode using mock authentication to avoid CORS issues. PI_API_KEY and PI_SECRET are not required in Testnet mode.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rinzindorjit/b4uesports.git
   cd b4uesports
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (copy `.env.example` to `.env` and fill in values)

## Development

### Running the Development Server

```bash
# Start the development server
npm run dev
```

This will start both the frontend and backend servers. The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:3001`.

### Development Environments

The application supports different environments:

1. **Localhost Development**: 
   - URL: `http://localhost:3000`
   - Pi SDK: Loaded in sandbox mode
   - Authentication: Mock authentication available

2. **Pi Browser Development**:
   - URL: Any URL opened in Pi Browser
   - Pi SDK: Loaded in sandbox mode
   - Authentication: Real Pi Network authentication

3. **Vercel Preview Deployments**:
   - URL: `*.vercel.app`
   - Pi SDK: Not loaded (CORS issues)
   - Authentication: Mock authentication

4. **Production**:
   - URL: Production domain
   - Pi SDK: Loaded in production mode
   - Authentication: Real Pi Network authentication

## Building for Production

To build the application for production:

```bash
npm run build
```

This command will:
1. Build the frontend using Vite
2. Bundle the backend server using esbuild
3. Output everything to the `dist/` directory

## Deployment

This application is configured for deployment on Vercel.

### Vercel Deployment

This application is configured for deployment on Vercel. The deployment process is automated through GitHub integration.

**Vercel Configuration** (`vercel.json`):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "buildCommand": "npm run vercel-build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ]
}
```

### Deployment Process

1. Push changes to the `main` branch
2. Vercel automatically builds and deploys the application
3. The build output is served from the `dist/` directory

### Environment Variables for Vercel

Make sure to set all required environment variables in your Vercel project settings:

```
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_ADMIN_TEMPLATE_ID=your_admin_template_id
EMAILJS_PUBLIC_KEY=your_public_key
ADMIN_EMAIL=admin@b4uesports.com
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

### Important Notes for Vercel Deployment

1. **Pi SDK Loading**: The Pi SDK is conditionally loaded to prevent CORS issues:
   - Loaded for Pi Browser and localhost development
   - Not loaded for Vercel deployments (uses mock authentication instead)

2. **Environment Detection**: The application automatically detects the environment and adjusts its behavior accordingly.

3. **Testnet Mode**: For Vercel deployments, Pi Network integration works in Testnet mode using mock authentication to avoid CORS issues.

## Authentication Flow

### Pi Network Authentication

The authentication flow varies by environment:

1. **Pi Browser/Localhost**:
   - Uses real Pi Network authentication
   - Requests permissions for payments, username, and wallet address
   - Verifies access token with Pi Network backend

2. **Vercel Deployments**:
   - Uses mock authentication
   - Generates mock user data and tokens
   - Simulates successful authentication without Pi Network

### Mock Authentication

For development and testing environments where Pi Network is not available:
- Generates mock user data
- Creates mock JWT tokens
- Simulates successful authentication flow

## API Endpoints

### Authentication
- `POST /api/auth/pi` - Authenticate with Pi Network or mock authentication

### Packages
- `GET /api/packages` - Get available top-up packages
- `POST /api/packages` - Create new package (admin only)
- `PUT /api/packages/:id` - Update package (admin only)
- `DELETE /api/packages/:id` - Delete package (admin only)

### Transactions
- `GET /api/transactions` - Get user transaction history
- `GET /api/transactions/admin` - Get all transactions (admin only)
- `POST /api/transactions` - Create new transaction

### Payments
- `POST /api/payment/approve` - Approve Pi payment
- `POST /api/payment/complete` - Complete Pi payment

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/game-account` - Add/update game account

### Admin
- `POST /api/admin/transactions/:id/complete` - Manually complete transaction
- `GET /api/admin/stats` - Get platform statistics

## Recent Improvements

### September 2025
1. **Fixed CORS Issues**: Implemented conditional Pi SDK loading to prevent CORS errors on Vercel deployments
2. **Enhanced Authentication**: Improved mock authentication flow for development environments
3. **Environment Detection**: Better detection of different environments (Pi Browser, localhost, Vercel)
4. **Loading State Management**: Fixed issues with authentication loading states getting stuck
5. **Error Handling**: Improved error handling and user feedback for authentication failures

### August 2025
1. **UI/UX Improvements**: Enhanced dashboard and package selection interfaces
2. **Performance Optimizations**: Improved loading times and reduced bundle size
3. **Security Updates**: Enhanced JWT token handling and validation

## Troubleshooting

### Common Issues

1. **Authentication Stuck on "Connecting..."**:
   - Check browser console for errors
   - Verify environment detection is working correctly
   - Ensure Pi SDK is properly loaded (or mock auth is triggered)

2. **CORS Errors**:
   - Verify Pi SDK is not being loaded on Vercel deployments
   - Check that conditional loading is working correctly

3. **Environment Variables Not Loading**:
   - Verify `.env` file is in the root directory
   - Check that variables are correctly named
   - For Vercel deployments, ensure variables are set in project settings

### Testing Different Environments

1. **Localhost**: Run `npm run dev` and open `http://localhost:3000`
2. **Pi Browser**: Open your Vercel deployment URL in Pi Browser
3. **Mock Authentication**: Available on Vercel deployments and can be tested in any browser

## Support

For issues and feature requests, please create a GitHub issue or contact the development team.