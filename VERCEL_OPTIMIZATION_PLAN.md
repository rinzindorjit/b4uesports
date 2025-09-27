# Vercel Optimization Plan

## Current Issue
We're exceeding Vercel's 12 Serverless Functions limit. Our current API structure has multiple separate functions:

1. `api/index.js` - Main API handler
2. `api/pi.js` - Pi Network API handler (imported dynamically)
3. `api/mock-pi-payment.js` - Mock payment handler (imported statically)
4. `api/pi-metadata.js` - Pi Network metadata handler (imported dynamically)

## Optimization Strategy
Consolidate all API functionality into a single Serverless Function by moving all handlers into `api/index.js`.

## Files to be Consolidated

### 1. Move `api/pi.js` content to `api/index.js`
- All Pi Network actions (price, balance, auth, create-payment, approve-payment, complete-payment, verify-payment, user, webhook, test)
- Remove the separate `api/pi.js` file

### 2. Move `api/mock-pi-payment.js` content to `api/index.js`
- Mock payment handler functionality
- Remove the separate `api/mock-pi-payment.js` file

### 3. Move `api/pi-metadata.js` content to `api/index.js`
- Pi Network metadata endpoint
- Remove the separate `api/pi-metadata.js` file

## Implementation Steps

1. Copy all handler functions from separate files into `api/index.js`
2. Update routing logic to call local functions instead of importing external modules
3. Remove the separate API handler files
4. Update import statements in `api/index.js`
5. Test all endpoints to ensure functionality is preserved

## Expected Outcome
- Single Serverless Function handling all API requests
- Reduced function count from 4+ to 1
- Maintained backward compatibility
- Improved performance due to reduced cold start times