# B4U Esports Pi Network Marketplace - Deployment Guide

## Prerequisites

1. Ensure you have a Vercel account
2. Ensure you have the Pi Network Developer Portal account
3. Obtain your actual Pi Network Server API Key

## Deployment Steps

### 1. Configure Environment Variables

Before deploying, you need to set up the environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following environment variables:
   - `PI_SERVER_API_KEY` - Your actual Pi Network Server API Key
   - `JWT_SECRET` - A secure secret for JWT token generation
   - `PI_SANDBOX` - Set to `true` for Testnet or `false` for Mainnet

### 2. Verify Domain Registration

Ensure that `https://b4uesports.vercel.app` is registered in your Pi Developer Portal:

1. Go to the Pi Developer Portal
2. Navigate to your app settings
3. Add `https://b4uesports.vercel.app` to the list of allowed domains

### 3. Deploy to Vercel

You can deploy using either the Vercel CLI or through GitHub integration:

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# Deploy the project
vercel --prod
```

#### Option B: Using GitHub Integration

1. Push your code to a GitHub repository
2. Connect your GitHub repository to Vercel
3. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 4. Post-Deployment Verification

After deployment, verify that everything is working correctly:

1. Visit `https://b4uesports.vercel.app` in the Pi Browser
2. Try to authenticate with your Pi Network account
3. Check the browser console for any errors
4. Verify that the authentication flow completes successfully

## Troubleshooting

### Common Issues

1. **CloudFront HTML Error**: 
   - Ensure the domain is registered in the Pi Developer Portal
   - Make sure you're accessing the site through the Pi Browser
   - Verify that the PI_SERVER_API_KEY is correctly configured

2. **Authentication Failures**:
   - Check that Pi.init() is called before Pi.authenticate()
   - Ensure authentication is triggered by a user action (button click)
   - Verify that the SDK is fully loaded before authentication

3. **Payment Processing Issues**:
   - Confirm that PI_SERVER_API_KEY is properly configured
   - Check that payment approval and completion are done server-side
   - Verify that the correct headers are included in API requests

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| PI_SERVER_API_KEY | Pi Network Server API Key | Yes |
| JWT_SECRET | Secret for JWT token generation | Yes |
| PI_SANDBOX | Set to true for Testnet, false for Mainnet | Yes |
| EMAILJS_SERVICE_ID | EmailJS Service ID (optional) | No |
| EMAILJS_TEMPLATE_ID | EmailJS Template ID (optional) | No |
| EMAILJS_PUBLIC_KEY | EmailJS Public Key (optional) | No |

## Security Considerations

1. Never commit actual API keys to version control
2. Always use environment variables for sensitive configuration
3. Regularly rotate your API keys
4. Use strong, random values for JWT_SECRET