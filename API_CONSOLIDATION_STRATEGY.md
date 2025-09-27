# API Consolidation Strategy

## Current State Analysis

We currently have multiple separate API handler files that each count as individual Serverless Functions in Vercel:

1. **[api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js)** - Main API router (1 function)
2. **[api/pi.js](file:///C:/Users/HP/B4U%20Esports/api/pi.js)** - Pi Network API handler (imported dynamically, counts as separate function)
3. **[api/mock-pi-payment.js](file:///C:/Users/HP/B4U%20Esports/api/mock-pi-payment.js)** - Mock payment handler (imported statically, counts as separate function)
4. **[api/pi-metadata.js](file:///C:/Users/HP/B4U%20Esports/api/pi-metadata.js)** - Pi Network metadata handler (imported dynamically, counts as separate function)

This totals at least 4 Serverless Functions, and we need to reduce this to stay within Vercel's 12-function limit.

## Consolidation Strategy

Instead of having separate files, we'll move all handler functions directly into [api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js) as local functions. This will reduce our Serverless Function count to just 1.

### Step 1: Move Pi Network API Handler Functions

Move all functions from [api/pi.js](file:///C:/Users/HP/B4U%20Esports/api/pi.js) into [api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js) as local functions:
- `handlePiPrice` - Price endpoint
- `handlePiBalance` - Balance endpoint
- `handlePiAuth` - Authentication endpoint
- `handlePiCreatePayment` - Payment creation endpoint
- `handlePiApprovePayment` - Payment approval endpoint
- `handlePiCompletePayment` - Payment completion endpoint
- `handlePiVerifyPayment` - Payment verification endpoint
- `handlePiUser` - User profile endpoint
- `handlePiWebhook` - Webhook endpoint
- `handlePiTest` - Test endpoint

### Step 2: Move Mock Payment Handler Function

Move the function from [api/mock-pi-payment.js](file:///C:/Users/HP/B4U%20Esports/api/mock-pi-payment.js) into [api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js):
- `handleMockPayment` - Mock payment handler

### Step 3: Move Pi Metadata Handler Function

Move the function from [api/pi-metadata.js](file:///C:/Users/HP/B4U%20Esports/api/pi-metadata.js) into [api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js):
- `handlePiMetadata` - Pi Network metadata endpoint

### Step 4: Update Routing Logic

Update the routing logic in [api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js) to call local functions instead of importing external modules:

```javascript
// Before (importing external modules)
const piHandler = (await import('./pi.js')).default;
return await piHandler(modifiedRequest, response);

// After (calling local functions)
return await handlePiApi(modifiedRequest, response);
```

### Step 5: Remove Separate Files

After consolidating all functions into [api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js), remove the separate files:
- Delete [api/pi.js](file:///C:/Users/HP/B4U%20Esports/api/pi.js)
- Delete [api/mock-pi-payment.js](file:///C:/Users/HP/B4U%20Esports/api/mock-pi-payment.js)
- Delete [api/pi-metadata.js](file:///C:/Users/HP/B4U%20Esports/api/pi-metadata.js)

## Implementation Plan

### 1. Create Local Handler Functions

In [api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js), create local versions of all handler functions:

```javascript
// Pi Network API handlers
async function handlePiApi(req, res) { /* ... */ }
async function handlePiPrice(req, res) { /* ... */ }
async function handlePiBalance(req, res) { /* ... */ }
async function handlePiAuth(req, res) { /* ... */ }
// ... etc

// Other handlers
async function handleMockPayment(req, res) { /* ... */ }
async function handlePiMetadata(req, res) { /* ... */ }
```

### 2. Update Routing Logic

Replace all dynamic imports with calls to local functions:

```javascript
// Before
} else if (path === '/api/pi') {
  const piHandler = (await import('./pi.js')).default;
  const modifiedRequest = { ... };
  return await piHandler(modifiedRequest, response);
}

// After
} else if (path === '/api/pi') {
  const modifiedRequest = { ... };
  return await handlePiApi(modifiedRequest, response);
}
```

### 3. Remove Imports

Remove the static import of mockPaymentHandler:
```javascript
// Remove this line
import mockPaymentHandler from './mock-pi-payment.js';
```

## Expected Benefits

1. **Reduced Function Count**: From 4+ functions to 1 function
2. **Improved Performance**: Reduced cold start times due to fewer functions
3. **Simplified Deployment**: Easier to manage a single API handler
4. **Maintained Compatibility**: All existing endpoints continue to work exactly as before

## Risk Mitigation

1. **Backup Current Files**: Keep copies of all files before making changes
2. **Incremental Changes**: Make changes one function at a time
3. **Thorough Testing**: Test all endpoints after each change
4. **Rollback Plan**: Ability to revert to original structure if issues arise

## Files to be Modified

1. **[api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js)** - Add all handler functions and update routing logic
2. **[api/pi.js](file:///C:/Users/HP/B4U%20Esports/api/pi.js)** - To be deleted after consolidation
3. **[api/mock-pi-payment.js](file:///C:/Users/HP/B4U%20Esports/api/mock-pi-payment.js)** - To be deleted after consolidation
4. **[api/pi-metadata.js](file:///C:/Users/HP/B4U%20Esports/api/pi-metadata.js)** - To be deleted after consolidation