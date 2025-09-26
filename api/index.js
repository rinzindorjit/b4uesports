// Main API handler for Vercel
import authHandler from './pi/auth.js';
import paymentsHandler from './pi/payments.js';
import userHandler from './pi/user.js';
import webhookHandler from './pi/webhook.js';
import metadataHandler from './metadata.js';
import mockPaymentHandler from './mock-pi-payment.js';
import createPaymentHandler from './pi/create-payment.js'; // Import the new payment creation handler
import paymentApprovalHandler from './pi/payment-approval.js'; // Import the new payment approval handler
import paymentCompletionHandler from './pi/payment-completion.js'; // Import the new payment completion handler
import { withCORS, setCORSHeaders, handlePreflight } from './utils/cors.js';

// Use built-in fetch when available (Node.js 18+ in Vercel)
const fetch = globalThis.fetch;

// Mock handlers for additional routes
async function handleProfileUpdate(request, response) {
  // In Vercel, the request body is already parsed as JSON
  const userData = request.body || {};
  
  // For mock purposes, return the updated user data
  // Check if profile is being completed (email and phone provided)
  const isProfileVerified = userData.email && userData.phone;
  
  const updatedUser = {
    id: 'mock-user-' + Date.now(),
    ...userData,
    isProfileVerified: isProfileVerified,
    updatedAt: new Date().toISOString()
  };

  response.status(200).json(updatedUser);
}

// Mock handler for admin login
async function handleAdminLogin(request, response) {
  // In Vercel, the request body is already parsed as JSON
  const body = request.body || {};
  
  const { username, password } = body;
  if (!username || !password) {
    return response.status(400).json({ message: 'Username and password required' });
  }

  // For mock purposes, we'll return a mock admin
  const mockAdmin = {
    id: 'admin-' + Date.now(),
    username: username,
    email: 'admin@example.com',
    role: 'admin',
  };

  // Generate a mock JWT token
  const mockToken = 'mock-admin-jwt-token-' + Date.now();

  response.status(200).json({
    admin: mockAdmin,
    token: mockToken
  });
}

// Handler for Pi price - using the real CoinGecko API
async function handlePiPrice(request, response) {
  try {
    console.log('Fetching Pi price from CoinGecko API');
    
    // Use the CoinGecko API with the provided demo API key
    const apiResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4'
    );

    if (!apiResponse.ok) {
      throw new Error(`CoinGecko API error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    console.log('CoinGecko API response:', data);
    
    const price = data['pi-network']?.usd || 0.01; // fallback to 0.01 if not available
    console.log('Extracted price:', price);
    
    const priceData = {
      price: price,
      lastUpdated: new Date().toISOString(), // Return as ISO string to match client expectations
    };

    response.status(200).json(priceData);
  } catch (error) {
    console.error('Failed to fetch Pi price from CoinGecko:', error);
    
    // Even in error cases, use a fixed fallback price rather than random
    // This ensures consistency between environments
    const fallbackPrice = {
      price: 0.0009, // Fixed price matching what you observed
      lastUpdated: new Date().toISOString(),
    };

    response.status(200).json(fallbackPrice);
  }
}

// Mock handler for Pi balance
async function handlePiBalance(request, response) {
  // For mock purposes, return a mock Pi balance
  const mockBalance = {
    balance: 1000.00000000, // Fixed balance for testnet
    currency: 'π',
    lastUpdated: new Date().toISOString(),
    isTestnet: true
  };

  response.status(200).json(mockBalance);
}

// Mock handler for packages
async function handlePackages(request, response) {
  // For mock purposes, return mock packages that match client-side DEFAULT_PACKAGES
  const mockPackages = [
    // PUBG Packages
    {
      id: 'pubg-0',
      name: '60 UC',
      description: 'Perfect for beginners',
      usdtValue: '1.5000',
      piPrice: (1.5000 / 0.0009).toString(), // Using fixed price
      currentPiPrice: 0.0009,
      gameCurrency: '60 UC',
      game: 'pubg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pubg-1',
      name: '325 UC',
      description: 'Great value for experienced players',
      usdtValue: '6.5000',
      piPrice: (6.5000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '325 UC',
      game: 'pubg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pubg-2',
      name: '660 UC',
      description: 'Popular choice for regular players',
      usdtValue: '12.0000',
      piPrice: (12.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '660 UC',
      game: 'pubg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pubg-3',
      name: '1800 UC',
      description: 'Best value for serious players',
      usdtValue: '25.0000',
      piPrice: (25.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '1800 UC',
      game: 'pubg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pubg-4',
      name: '3850 UC',
      description: 'Premium package for top players',
      usdtValue: '49.0000',
      piPrice: (49.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '3850 UC',
      game: 'pubg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pubg-5',
      name: '8100 UC',
      description: 'Ultimate package for pros',
      usdtValue: '96.0000',
      piPrice: (96.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '8100 UC',
      game: 'pubg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pubg-6',
      name: '16200 UC',
      description: 'Maximum value package',
      usdtValue: '186.0000',
      piPrice: (186.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '16200 UC',
      game: 'pubg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pubg-7',
      name: '24300 UC',
      description: 'Elite player package',
      usdtValue: '278.0000',
      piPrice: (278.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '24300 UC',
      game: 'pubg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pubg-8',
      name: '32400 UC',
      description: 'Legendary package',
      usdtValue: '369.0000',
      piPrice: (369.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '32400 UC',
      game: 'pubg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'pubg-9',
      name: '40500 UC',
      description: 'Mythic package',
      usdtValue: '459.0000',
      piPrice: (459.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '40500 UC',
      game: 'pubg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // MLBB Packages
    {
      id: 'mlbb-0',
      name: '56 Diamonds',
      description: 'Perfect for beginners',
      usdtValue: '3.0000',
      piPrice: (3.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '56 Diamonds',
      game: 'mlbb',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mlbb-1',
      name: '278 Diamonds',
      description: 'Great value for experienced players',
      usdtValue: '6.0000',
      piPrice: (6.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '278 Diamonds',
      game: 'mlbb',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mlbb-2',
      name: '571 Diamonds',
      description: 'Popular choice for regular players',
      usdtValue: '11.0000',
      piPrice: (11.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '571 Diamonds',
      game: 'mlbb',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mlbb-3',
      name: '1783 Diamonds',
      description: 'Best value for serious players',
      usdtValue: '33.0000',
      piPrice: (33.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '1783 Diamonds',
      game: 'mlbb',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mlbb-4',
      name: '3005 Diamonds',
      description: 'Premium package for top players',
      usdtValue: '52.0000',
      piPrice: (52.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '3005 Diamonds',
      game: 'mlbb',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mlbb-5',
      name: '6012 Diamonds',
      description: 'Ultimate package for pros',
      usdtValue: '99.0000',
      piPrice: (99.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '6012 Diamonds',
      game: 'mlbb',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mlbb-6',
      name: '12000 Diamonds',
      description: 'Maximum value package',
      usdtValue: '200.0000',
      piPrice: (200.0000 / 0.0009).toString(),
      currentPiPrice: 0.0009,
      gameCurrency: '12000 Diamonds',
      game: 'mlbb',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  response.status(200).json(mockPackages);
}

// Mock handler for transactions
async function handleTransactions(request, response) {
  // For mock purposes, return mock transactions
  const mockTransactions = [
    {
      id: 'transaction-1',
      userId: 'user-123',
      packageId: 'pubg-0',
      paymentId: 'payment-123',
      piAmount: '1666.67',
      usdAmount: '1.5000',
      piPriceAtTime: '0.0009',
      status: 'completed',
      gameAccount: {
        ign: 'PlayerOne',
        uid: 'UID123456'
      },
      metadata: {},
      txid: 'tx-123456',
      emailSent: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  response.status(200).json(mockTransactions);
}

// Mock handler for payment approval
async function handlePaymentApproval(request, response) {
  // In Vercel, the request body is already parsed as JSON
  const body = request.body || {};
  
  const { paymentId } = body;
  if (!paymentId) {
    return response.status(400).json({ message: 'Payment ID required' });
  }

  // For mock purposes, we'll return a success response
  response.status(200).json({ 
    success: true, 
    transactionId: 'transaction-' + Date.now() 
  });
}

// Mock handler for payment completion
async function handlePaymentCompletion(request, response) {
  // In Vercel, the request body is already parsed as JSON
  const body = request.body || {};
  
  const { paymentId, txid } = body;
  if (!paymentId || !txid) {
    return response.status(400).json({ message: 'Payment ID and txid required' });
  }

  // For mock purposes, we'll return a success response
  response.status(200).json({ 
    success: true, 
    transactionId: 'transaction-' + Date.now(),
    txid
  });
}

// Mock handler for analytics
async function handleAnalytics(request, response) {
  // For mock purposes, return mock analytics
  const mockAnalytics = {
    totalUsers: 1234,
    totalTransactions: 567,
    totalRevenue: 1234.56,
    activeUsers: 234,
    recentTransactions: 45
  };

  response.status(200).json(mockAnalytics);
}

// Test handler for fetch
async function handleTestFetch(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Test if fetch is available
    if (typeof fetch === 'undefined') {
      return response.status(500).json({ error: "Fetch is not available" });
    }

    // Test a simple fetch request
    const apiResponse = await fetch('https://httpbin.org/get');
    const data = await apiResponse.json();

    return response.status(200).json({
      message: "Fetch is working correctly",
      data: data
    });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}

// Test handler for Pi Network API
async function handleTestPiApi(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  const piApiUrl = "https://sandbox.minepi.com/v2/payments";

  if (!process.env.PI_SERVER_API_KEY) {
    return response.status(500).json({ error: "Missing PI_SERVER_API_KEY" });
  }

  try {
    console.log('Testing direct connection to Pi Network API');
    console.log('URL:', piApiUrl);
    console.log('API Key present:', !!process.env.PI_SERVER_API_KEY);

    const apiResponse = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount: 1.0,
        memo: "Test Payment",
        metadata: { test: true },
      }),
    });

    console.log('Response status:', apiResponse.status);
    console.log('Response headers:', [...apiResponse.headers.entries()]);

    const text = await apiResponse.text();
    console.log('Response text:', text.substring(0, 500));

    let data;
    try { 
      data = JSON.parse(text); 
    } catch { 
      data = { raw: text }; 
    }

    return response.status(apiResponse.status).json({
      message: "Direct API test completed",
      status: apiResponse.status,
      data: data
    });
  } catch (error) {
    console.error('Test error:', error);
    return response.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}

// Test handler for environment variables
async function handleTestEnv(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  try {
    const envVars = {
      PI_SERVER_API_KEY: process.env.PI_SERVER_API_KEY ? 'SET' : 'NOT SET',
      PI_SANDBOX_MODE: process.env.PI_SANDBOX_MODE,
      NODE_ENV: process.env.NODE_ENV,
      PI_SECRET_KEY: process.env.PI_SECRET_KEY ? 'SET' : 'NOT SET'
    };

    // Log to console for debugging
    console.log('Environment variables:', envVars);

    return response.status(200).json({
      message: "Environment variables check completed",
      envVars: envVars
    });
  } catch (error) {
    console.error('Test error:', error);
    return response.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}

// Diagnostic handler for Pi Network issues
async function handleDiagnosePiIssue(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Log environment info
    console.log('=== Pi Network API Diagnostic ===');
    console.log('PI_SERVER_API_KEY present:', !!process.env.PI_SERVER_API_KEY);
    console.log('PI_SERVER_API_KEY length:', process.env.PI_SERVER_API_KEY?.length || 0);
    console.log('PI_SANDBOX_MODE:', process.env.PI_SANDBOX_MODE);
    
    // Test 1: Simple GET request to see if we can reach the domain
    console.log('Test 1: Checking domain connectivity...');
    try {
      const getResponse = await fetch('https://sandbox.minepi.com/v2/payments', {
        method: 'GET',
        headers: {
          'Authorization': `Key ${process.env.PI_SERVER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('GET request status:', getResponse.status);
    } catch (getError) {
      console.log('GET request error:', getError.message);
    }

    // Test 2: Actual POST request with proper error handling
    console.log('Test 2: Sending POST request to Pi Network API...');
    const piApiUrl = "https://sandbox.minepi.com/v2/payments";
    
    const apiResponse = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        amount: 1.0,
        memo: "Diagnostic Test Payment",
        metadata: { test: true, timestamp: Date.now() },
      }),
    });

    console.log('Pi API Response Status:', apiResponse.status);
    console.log('Pi API Response Headers:', [...apiResponse.headers.entries()]);
    
    const text = await apiResponse.text();
    console.log('Pi API Response Text (first 1000 chars):', text.substring(0, 1000));
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.log('Response is not JSON:', parseError.message);
      data = { rawResponse: text.substring(0, 1000) };
    }

    if (apiResponse.status === 403) {
      console.log('❌ 403 ERROR DETECTED - This is the main issue');
      return response.status(403).json({
        error: "Pi Network API Access Blocked",
        message: "403 Forbidden - Check if request is hitting CDN instead of API server",
        response: data,
        diagnostic: {
          url: piApiUrl,
          method: "POST",
          headers: {
            "Authorization": "Key [REDACTED]",
            "Content-Type": "application/json",
            "Accept": "application/json",
          }
        }
      });
    }

    return response.status(apiResponse.ok ? 200 : apiResponse.status).json({
      message: "Diagnostic completed",
      status: apiResponse.status,
      data: data
    });

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return response.status(500).json({ 
      error: "Diagnostic failed",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Remove the CORS wrapper to avoid interference
export default apiHandler;

async function apiHandler(request, response) {
  console.log('=== DEBUG API REQUEST ===');
  console.log('Full request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Request headers:', request.headers);
  console.log('Request body:', request.body);
  console.log('Request body type:', typeof request.body);
  
  // Set CORS headers for Pi Browser compatibility
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  // Extract the path from the request
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const path = url.pathname;
    
    console.log('API request received:', { 
      method: request.method, 
      path, 
      url: request.url, 
      headers: request.headers
    });
    
    // Log request body for debugging
    console.log('Request body:', request.body);
    console.log('Request body type:', typeof request.body);
    
    // Route to appropriate handler based on path
    if (path === '/api/pi/auth' || path === '/api/auth/pi') {
      console.log('Routing to auth handler');
      return await authHandler(request, response);
    } else if (path === '/api/pi/payments') {
      console.log('Routing to payments handler');
      return await paymentsHandler(request, response);
    } else if (path === '/api/pi/user') {
      console.log('Routing to user handler');
      return await userHandler(request, response);
    } else if (path === '/api/pi/webhook') {
      console.log('Routing to webhook handler');
      return await webhookHandler(request, response);
    } else if (path === '/api/metadata') {
      console.log('Routing to metadata handler');
      return await metadataHandler(request, response);
    } else if (path === '/api/profile') {
      console.log('Routing to profile handler');
      return await handleProfileUpdate(request, response);
    } else if (path === '/api/admin/login') {
      console.log('Routing to admin login handler');
      return await handleAdminLogin(request, response);
    } else if (path === '/api/pi-price') {
      console.log('Routing to Pi price handler');
      return await handlePiPrice(request, response);
    } else if (path === '/api/pi-balance') {
      console.log('Routing to Pi balance handler');
      return await handlePiBalance(request, response);
    } else if (path === '/api/packages') {
      console.log('Routing to packages handler');
      return await handlePackages(request, response);
    } else if (path === '/api/transactions') {
      console.log('Routing to transactions handler');
      return await handleTransactions(request, response);
    } else if (path === '/api/payment/approve') {
      console.log('Routing to payment approval handler');
      return await paymentApprovalHandler(request, response);
    } else if (path === '/api/payment/complete') {
      console.log('Routing to payment completion handler');
      return await paymentCompletionHandler(request, response);
    } else if (path === '/api/admin/analytics') {
      console.log('Routing to analytics handler');
      return await handleAnalytics(request, response);
    } else if (path === '/api/mock-pi-payment') {
      console.log('Routing to mock payment handler');
      return await mockPaymentHandler(request, response);
    } else if (path === '/api/pi/create-payment') {
      console.log('Routing to payment creation handler');
      return await createPaymentHandler(request, response);
    } else if (path === '/api/test-fetch') {
      console.log('Routing to test fetch handler');
      return await handleTestFetch(request, response);
    } else if (path === '/api/test-pi-api') {
      console.log('Routing to test Pi API handler');
      return await handleTestPiApi(request, response);
    } else if (path === '/api/test-env') {
      console.log('Routing to test environment variables handler');
      return await handleTestEnv(request, response);
    } else if (path === '/api/diagnose-pi-issue') {
      console.log('Routing to Pi Network diagnostic handler');
      return await handleDiagnosePiIssue(request, response);
    } else if (path.startsWith('/api/')) {
      console.log('API endpoint not found:', path);
      response.status(404).json({ message: `API endpoint not found: ${path}` });
    } else {
      // For all non-API routes, return a simple response for now
      console.log('Serving non-API route:', path);
      response.status(200).json({ message: 'B4U Esports is running' });
    }
  } catch (error) {
    console.error('API handler error:', error);
    console.error('Error stack:', error.stack);
    response.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: error.stack
    });
  }
}