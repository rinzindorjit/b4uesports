# B4U Esports Pi Network Testnet Deployment

This is a testnet version of the B4U Esports application, specifically configured for Pi Network testnet development.

## Key Features

1. **Pi SDK Configuration**: Properly configured for sandbox/testnet environment
2. **Mock Authentication**: Uses mock authentication for testing without PI_SECRET
3. **CORS Handling**: Configured to work with Pi Network sandbox environment
4. **Validation Key**: Includes the Pi Network domain validation key

## Configuration

The application is configured to:
- Always load the Pi SDK from the sandbox domain (`https://sandbox.minepi.com/pi-sdk.js`)
- Initialize the Pi SDK in sandbox mode
- Use mock authentication for testnet development
- Handle CORS properly for the Pi Network sandbox environment

## Deployment

This application is deployed to Netlify at: https://b4uesportspi.netlify.app

## Testing in Pi Browser

To test in the Pi Browser sandbox:
1. Open the Pi Browser app
2. Navigate to https://sandbox.minepi.com/mobile-app-ui/app/b4u-esports-e763af8471870a10
3. The application should load properly without CORS errors

## Troubleshooting

If you encounter connection issues:
1. Ensure the Pi SDK is properly loaded from the sandbox domain
2. Check that Content Security Policy headers allow loading from sandbox.minepi.com
3. Verify that the validation-key.txt file is accessible at the root of the domain
4. Confirm that mock authentication is being used for testnet development

## Development Notes

- This is a testnet application and should not include PI_SECRET
- All Pi SDK interactions are configured for sandbox mode
- Authentication and payment flows use mock implementations for testing