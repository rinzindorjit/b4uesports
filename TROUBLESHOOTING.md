# Pi Network API Troubleshooting Guide

## Common Issues and Solutions

### 1. 403 Forbidden Error
**Error Message**: "This distribution is not configured to allow the HTTP request method that was used for this request. The distribution supports only cachable requests."

**Cause**: Requests are being intercepted by a CDN that only allows GET requests, but your application is sending POST requests.

**Solutions**:
1. **Verify you're using the correct endpoint**: Always use `https://sandbox.minepi.com/v2/payments` for Testnet
2. **Check environment variables**: Ensure `PI_SERVER_API_KEY` is correctly set in Vercel
3. **Verify API key**: Make sure your API key is valid and has the correct permissions

### 2. Environment Variables Not Set
**Symptoms**: "PI_SERVER_API_KEY missing" errors

**Solution**:
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - `PI_SERVER_API_KEY=2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya`
   - `PI_SANDBOX_MODE=true`
   - `NODE_ENV=development`

### 3. CORS Issues
**Symptoms**: Browser console errors about CORS

**Solution**:
1. The API handlers now include proper CORS headers
2. If issues persist, check the Vercel configuration in `vercel.json`

## Testing Procedures

### 1. Basic Connectivity Test
```bash
curl -X GET https://sandbox.minepi.com/v2/payments \
  -H "Authorization: Key YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### 2. Payment Creation Test
```bash
curl -X POST https://b4uesports.vercel.app/api/pi/create-payment \
  -H "Content-Type: application/json" \
  -d '{"paymentData":{"amount":1.0,"memo":"Test Payment","metadata":{"test":true}}}'
```

### 3. Diagnostic Test
```bash
curl -X POST https://b4uesports.vercel.app/api/diagnose-pi-issue
```

## Vercel Deployment Checklist

- [ ] All code changes pushed to repository
- [ ] Environment variables configured in Vercel dashboard
- [ ] Deployment completed successfully
- [ ] API endpoints accessible
- [ ] Payment creation working without 403 errors

## Debugging Steps

1. **Check Vercel logs**: Look for any error messages in the deployment logs
2. **Test locally**: Run the application locally to verify it works before deploying
3. **Use diagnostic endpoints**: The `/api/test-env` and `/api/diagnose-pi-issue` endpoints can help identify problems
4. **Verify API key**: Test your API key directly with Pi Network's API

## Contact Support

If issues persist:
1. Check the Pi Network developer documentation
2. Verify your application is registered correctly in the Pi Developer Portal
3. Ensure your domain is properly configured for Testnet access