# B4U Esports - Pi Network Integrated Marketplace & User Portal

B4U Esports is a comprehensive e-commerce platform for gaming packages, integrated with Pi Network for seamless Pi currency transactions. The platform supports multiple games including PUBG Mobile and Mobile Legends: Bang Bang.

## Features

1. **Multi-Game Support**: PUBG Mobile and Mobile Legends packages
2. **Pi Network Integration**: Native Pi currency payments
3. **Real-time Pricing**: Live Pi/USDT exchange rates from CoinGecko
4. **User Profiles**: Account management with game account linking
5. **Transaction History**: Complete purchase tracking
6. **Admin Dashboard**: Package management and analytics
7. **Email Notifications**: Purchase confirmations and admin alerts
8. **Responsive Design**: Mobile-friendly interface

## Pi Network Integration

### Authentication

The application supports two types of authentication:

1. **Real Pi Network Authentication** - For production and Pi Browser environments
2. **Mock Authentication** - For development, testing, and Vercel deployments

### Configuration

To configure Pi Network integration, you need to set the following environment variables in your `.env` file:

```env
# Pi Network Configuration
PI_SECRET_KEY=your_actual_pi_secret_key_here
PI_SERVER_API_KEY=your_actual_pi_server_api_key_here
PI_APP_ID=your_actual_app_id_here
```

To obtain these credentials:
1. Register your app at the [Pi Network Developer Portal](https://minepi.com)
2. Create a new app and obtain your APP_ID
3. Generate your SECRET_KEY and SERVER_API_KEY from the developer console

### Authentication Flow

#### Pi Browser/Localhost
- Uses real Pi Network authentication
- Requests permissions for payments, username, and wallet address
- Verifies access token with Pi Network backend

#### Vercel Deployments
- Uses mock authentication to avoid CORS issues
- Generates mock user data and tokens for testing

#### Production
- Uses real Pi Network authentication
- Requests permissions for payments, username, and wallet address
- Verifies access token with Pi Network backend

## Building for Production

To build the application for production:

```bash
npm run build
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# EmailJS Configuration
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_ADMIN_TEMPLATE_ID=your_admin_template_id
EMAILJS_PUBLIC_KEY=your_public_key
ADMIN_EMAIL=admin@b4uesports.com

# Pi Network Configuration
PI_SECRET_KEY=your_actual_pi_secret_key_here
PI_SERVER_API_KEY=your_actual_pi_server_api_key_here
PI_APP_ID=your_actual_app_id_here

# Database
DATABASE_URL=your_database_url

# JWT
JWT_SECRET=your_jwt_secret

# CoinGecko API
COINGECKO_API_KEY=your_coingecko_api_key

# Other
NODE_ENV=development
```

## Development

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3005](http://localhost:3005) in your browser.

### Testnet Mode

For Pi Network testnet development, the application is configured to:
1. Always load the Pi SDK from the sandbox domain (`https://sandbox.minepi.com/pi-sdk.js`)
2. Initialize the Pi SDK in sandbox mode
3. Use mock authentication for testing without PI_SECRET
4. Handle CORS properly for the Pi Network sandbox environment

## Deployment

### Vercel

The application is configured for Vercel deployment with proper CORS handling.

### Netlify

For Netlify deployment, use the testnet configuration.

## Troubleshooting

If you encounter connection issues:
1. Ensure the Pi SDK is properly loaded from the sandbox domain
2. Check that Content Security Policy headers allow loading from sandbox.minepi.com
3. Verify that the validation-key.txt file is accessible at the root of the domain
4. Confirm that mock authentication is being used for testnet development
5. Make sure your app is properly registered in the Pi Network developer console with the correct domain

## License

This project is licensed under the MIT License.