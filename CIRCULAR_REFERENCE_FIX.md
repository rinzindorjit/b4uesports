# Circular Reference Error Fix

## Issue Identified
The API was encountering a "TypeError: Converting circular structure to JSON" error when trying to log the full request object. This happened because the request object contains circular references (e.g., socket references) that cannot be serialized with JSON.stringify.

## Solution Implemented

### 1. Fixed Logging in Main API Handler ([api/index.js](file:///C:/Users/HP/B4U%20Esports/api/index.js))
Instead of logging the entire request object, we now log only specific safe parts:
```javascript
console.log('Request headers:', {
  'x-requested-with': request.headers['x-requested-with'],
  'user-agent': request.headers['user-agent'],
  'content-type': request.headers['content-type'],
  'origin': request.headers['origin']
});
```

### 2. Fixed Logging in Pi Handler ([api/pi.js](file:///C:/Users/HP/B4U%20Esports/api/pi.js))
Similarly, we avoid logging the full request object in the Pi handler:
```javascript
console.log("Pi API Handler → Safe request info:", {
  method: method,
  action: action,
  hasBody: !!body,
  queryKeys: Object.keys(query)
});
```

### 3. Created Dedicated Endpoint Handlers
To further isolate and simplify the endpoint handling, we created dedicated handlers:

#### Pi Balance Handler ([api/pi-balance.js](file:///C:/Users/HP/B4U%20Esports/api/pi-balance.js))
- Simple, focused handler for balance requests
- No complex request object manipulation
- Direct response with mock data

#### Pi Price Handler ([api/pi-price.js](file:///C:/Users/HP/B4U%20Esports/api/pi-price.js))
- Simple, focused handler for price requests
- Direct response with mock data

### 4. Updated Routing
Modified the main API handler to route to these dedicated handlers:
```javascript
} else if (path === '/api/pi-balance') {
  // Handle /api/pi-balance endpoint with dedicated handler
  console.log('Routing to /api/pi-balance endpoint');
  const piBalanceHandler = (await import('./pi-balance.js')).default;
  return await piBalanceHandler(request, response);
} else if (path === '/api/pi-price') {
  // Handle /api/pi-price endpoint with dedicated handler
  console.log('Routing to /api/pi-price endpoint');
  const piPriceHandler = (await import('./pi-price.js')).default;
  return await piPriceHandler(request, response);
}
```

## Expected Outcome
These changes should resolve the circular reference error and ensure that:
1. The [/api/pi-balance](file:///C:/Users/HP/B4U%20Esports/api/pi-balance) endpoint returns the correct mock balance data
2. The [/api/pi-price](file:///C:/Users/HP/B4U%20Esports/api/pi-price) endpoint returns the correct mock price data
3. No more circular reference errors in the logs
4. Simplified and more reliable endpoint handling

## Verification
After deploying these changes, the endpoints should return:
- [/api/pi-balance](file:///C:/Users/HP/B4U%20Esports/api/pi-balance): `{"balance":1000,"currency":"PI","lastUpdated":"...","isTestnet":true}`
- [/api/pi-price](file:///C:/Users/HP/B4U%20Esports/api/pi-price): `{"price":0.0009,"lastUpdated":"...","isTestnet":true}`