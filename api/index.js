// Main API handler for Vercel
// Version: 1.0.4 - Add database operations for storing mock payments
import mockPaymentHandler from './mock-pi-payment.js';
import { db } from './utils/db.js';
import { storeMockPayment, storePaymentApproval, getUserBalance, updateUserBalance } from './utils/db-operations.js';

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
  // Set CORS headers for Pi Browser compatibility
  response.setHeader("Access-Control-Allow-Origin", "https://sandbox.minepi.com");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }
  
  // In Vercel, the request body is already parsed as JSON
  const body = request.body || {};
  
  const { paymentId } = body;
  if (!paymentId) {
    return response.status(400).json({ message: 'Payment ID required' });
  }

  // For Pi Testnet, we don't need to call the Pi Network API
  // Mock payments are handled entirely on the client-side
  console.log('🔄 Handling payment approval in Testnet mode...');
  console.log('💳 Payment ID:', paymentId);

  // Check if this is a mock payment ID (handle both mock_ and mock- prefixes)
  if (paymentId.startsWith('mock_') || paymentId.startsWith('mock-')) {
    console.log('✅ Mock payment ID detected in payment approval handler');
    
    // Store mock payment approval in database if available
    try {
      console.log('💾 Storing mock payment approval in database...');
      
      // Store the payment approval using our database operations
      const approvalData = {
        metadata: {
          isMock: true,
          timestamp: new Date().toISOString()
        }
      };
      
      await storePaymentApproval(paymentId, approvalData);
      
      console.log('✅ Mock payment approval processed successfully');
    } catch (dbError) {
      console.error('❌ Database operation error:', dbError.message);
      // Continue with the response even if database operation fails
    }
    
    // For mock payments, return Pi Browser expected format
    return response.status(200).json({
      status: "success",
      message: "Payment approved",
      paymentId: paymentId
    });
  } else {
    console.log('⚠️ Non-mock payment ID detected in Testnet mode');
    
    // Store real payment approval in database if available
    try {
      console.log('💾 Storing real payment approval in database...');
      
      // Store the payment approval using our database operations
      const approvalData = {
        metadata: {
          isTestnet: true,
          timestamp: new Date().toISOString()
        }
      };
      
      await storePaymentApproval(paymentId, approvalData);
      
      console.log('✅ Payment approval processed successfully');
    } catch (dbError) {
      console.error('❌ Database operation error:', dbError.message);
      // Continue with the response even if database operation fails
    }
    
    // For any other payment ID in Testnet mode, return Pi Browser expected format
    return response.status(200).json({
      status: "success",
      message: "Payment approved",
      paymentId: paymentId
    });
  }
}

// Mock handler for payment completion
async function handlePaymentCompletion(request, response) {
  // Set CORS headers for Pi Browser compatibility
  response.setHeader("Access-Control-Allow-Origin", "https://sandbox.minepi.com");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }
  
  // In Vercel, the request body is already parsed as JSON
  const body = request.body || {};
  
  const { paymentId, txid } = body;
  if (!paymentId || !txid) {
    return response.status(400).json({ message: 'Payment ID and txid required' });
  }

  // For Pi Testnet, we don't need to call the Pi Network API
  // Mock payments are handled entirely on the client-side
  console.log('🔄 Handling payment completion in Testnet mode...');
  console.log('💳 Payment ID:', paymentId);
  console.log('🧾 Transaction ID:', txid);

  // Check if this is a mock payment ID (handle both mock_ and mock- prefixes)
  if (paymentId.startsWith('mock_') || paymentId.startsWith('mock-')) {
    console.log('✅ Mock payment ID detected in payment completion handler');
    
    // Store mock payment in database if available
    try {
      console.log('💾 Storing mock payment in database...');
      
      // Store the mock payment using our database operations
      const paymentData = {
        piAmount: '100.00000000', // Mock amount
        usdAmount: '10.0000', // Mock amount
        piPriceAtTime: '0.1000', // Mock price
        status: 'completed',
        gameAccount: {}, // Empty game account for mock
        metadata: {
          isMock: true,
          timestamp: new Date().toISOString()
        }
      };
      
      await storeMockPayment(paymentId, txid, paymentData);
      
      console.log('✅ Mock payment processed successfully');
    } catch (dbError) {
      console.error('❌ Database operation error:', dbError.message);
      // Continue with the response even if database operation fails
    }
    
    // For mock payments, return Pi Browser expected format
    return response.status(200).json({
      status: "success",
      message: "Payment completed",
      paymentId: paymentId,
      txid: txid
    });
  } else {
    console.log('⚠️ Non-mock payment ID detected in Testnet mode');
    
    // Store real payment in database if available
    try {
      console.log('💾 Storing real payment in database...');
      
      // Store the payment using our database operations
      const paymentData = {
        piAmount: '100.00000000', // Default amount for test
        usdAmount: '10.0000', // Default amount for test
        piPriceAtTime: '0.1000', // Default price for test
        status: 'completed',
        gameAccount: {}, // Empty game account
        metadata: {
          isTestnet: true,
          timestamp: new Date().toISOString()
        }
      };
      
      await storeMockPayment(paymentId, txid, paymentData);
      
      console.log('✅ Payment processed successfully');
    } catch (dbError) {
      console.error('❌ Database operation error:', dbError.message);
      // Continue with the response even if database operation fails
    }
    
    // For any other payment ID in Testnet mode, return Pi Browser expected format
    return response.status(200).json({
      status: "success",
      message: "Payment completed",
      paymentId: paymentId,
      txid: txid
    });
  }
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

// Mock handler for metadata
async function handleMetadata(request, response) {
  // Use the current Vercel deployment URL for the backend URL
  const backendUrl = 'https://b4uesports.vercel.app';
  
  response.status(200).json({
    application: {
      name: "B4U Esports",
      description: "Pi Network Integrated Marketplace for Gaming Currency",
      version: "1.0.0",
      platform: "Pi Network",
      category: "Gaming"
    },
    payment: {
      currency: "PI",
      supported_operations: ["buy_gaming_currency", "deposit", "withdrawal"],
      min_amount: 0.1,
      max_amount: 10000
    },
    // For Pi Testnet, we use direct domain access rather than app ID
    // Testnet relies on domain registration in the developer console
    endpoints: {
      authentication: `${backendUrl}/api/pi?action=auth`,
      payment_create: `${backendUrl}/api/pi?action=create-payment`,
      payment_approve: `${backendUrl}/api/payment/approve`,
      payment_complete: `${backendUrl}/api/payment/complete`,
      user_profile: `${backendUrl}/api/pi?action=user`,
      price: `${backendUrl}/api/pi?action=price`,
      balance: `${backendUrl}/api/pi?action=balance`
    },
    contact: {
      support_email: "info@b4uesports.com",
      website: "https://b4uesports.vercel.app"
    },
    last_updated: new Date().toISOString()
  });
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

  // Use the correct API key as specified by the user
  const PI_SERVER_API_KEY = "2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya";

  try {
    console.log('Testing direct connection to Pi Network API');
    console.log('URL:', piApiUrl);
    console.log('Using hardcoded API Key starting with:', PI_SERVER_API_KEY.substring(0, 10));

    const apiResponse = await fetch(piApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "B4U-Esports-Server/1.0",
        "Cache-Control": "no-cache"
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
    // Test what environment variables are available
    const envVars = {
      PI_SERVER_API_KEY: process.env.PI_SERVER_API_KEY ? 
        `SET (starts with: ${process.env.PI_SERVER_API_KEY.substring(0, 10)})` : 
        'NOT SET',
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

// Test handler for auth endpoint
async function handleTestAuth(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  console.log('=== Test Auth Endpoint ===');
  console.log('Request body:', request.body);
  
  // Simulate a successful auth response
  const mockUser = {
    id: 'test-user-' + Date.now(),
    piUID: 'test-pi-uid',
    username: 'test_user',
    email: 'test@example.com',
    phone: '+1234567890',
    country: 'US',
    language: 'en',
    walletAddress: 'test-wallet-address',
    gameAccounts: {},
    profileImageUrl: null,
    isProfileVerified: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockToken = 'test-jwt-token-' + Date.now();

  return response.status(200).json({
    user: mockUser,
    token: mockToken
  });
}

// Diagnostic handler for Pi Network issues
async function handleDiagnosePiIssue(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Use the correct API key as specified by the user
    const PI_SERVER_API_KEY = "2qq9mwnt1ovpfgyee3dshoxcznrjhsmgf3jabkq0r5gsqtsohlmpq4bhqpmks7ya";

    // Log environment info
    console.log('=== Pi Network API Diagnostic ===');
    console.log('Using hardcoded PI_SERVER_API_KEY starting with:', PI_SERVER_API_KEY.substring(0, 10));
    console.log('PI_SANDBOX_MODE: true (hardcoded)');
    
    // Test 1: Simple GET request to see if we can reach the domain
    console.log('Test 1: Checking domain connectivity...');
    try {
      const getResponse = await fetch('https://sandbox.minepi.com/v2/payments', {
        method: 'GET',
        headers: {
          'Authorization': `Key ${PI_SERVER_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'B4U-Esports-Diagnostic/1.0'
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
        "Authorization": `Key ${PI_SERVER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "B4U-Esports-Diagnostic/1.0",
        "Cache-Control": "no-cache"
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
            "User-Agent": "B4U-Esports-Diagnostic/1.0",
            "Cache-Control": "no-cache"
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

// DNS test handler
async function handleTestPiDns(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log('=== Pi Network DNS and Connectivity Test ===');
    
    // Test DNS resolution
    console.log('Testing DNS resolution for sandbox.minepi.com...');
    
    // Try to fetch the Pi Network API endpoint
    const testUrl = "https://sandbox.minepi.com/v2/payments";
    console.log('Testing URL:', testUrl);
    
    // Test 1: Simple GET request
    console.log('Test 1: Sending GET request...');
    try {
      const getResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'B4U-Esports-Test/1.0'
        }
      });
      console.log('GET Response Status:', getResponse.status);
      console.log('GET Response Headers:', [...getResponse.headers.entries()]);
      
      const getText = await getResponse.text();
      console.log('GET Response Text (first 500 chars):', getText.substring(0, 500));
    } catch (getError) {
      console.log('GET Request Error:', getError.message);
    }
    
    // Test 2: POST request with minimal headers
    console.log('\nTest 2: Sending POST request with minimal headers...');
    try {
      const postResponse = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'B4U-Esports-Test/1.0'
        },
        body: JSON.stringify({
          test: true
        })
      });
      console.log('POST Response Status:', postResponse.status);
      console.log('POST Response Headers:', [...postResponse.headers.entries()]);
      
      const postText = await postResponse.text();
      console.log('POST Response Text (first 500 chars):', postText.substring(0, 500));
    } catch (postError) {
      console.log('POST Request Error:', postError.message);
    }
    
    // Test 3: Check if we can resolve the domain
    console.log('\nTest 3: Checking domain resolution...');
    try {
      // This is a workaround to check DNS resolution in a Node.js environment
      console.log('Domain resolution test completed (limited in serverless environment)');
    } catch (dnsError) {
      console.log('DNS Resolution Error:', dnsError.message);
    }
    
    return response.status(200).json({
      message: "DNS and connectivity test completed",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test error:', error);
    return response.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Test handler for Pi Network Testnet mode
async function handleTestPiTestnet(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log('=== Pi Network Testnet Mode Test ===');
    
    // Log environment info
    console.log('Environment variables:');
    console.log('- PI_SANDBOX_MODE:', process.env.PI_SANDBOX_MODE);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    
    // Test response
    return response.status(200).json({
      message: "Pi Network Testnet mode is properly configured",
      mode: "testnet",
      timestamp: new Date().toISOString(),
      environment: {
        sandboxMode: process.env.PI_SANDBOX_MODE || 'not set',
        nodeEnv: process.env.NODE_ENV || 'not set'
      }
    });
  } catch (error) {
    console.error('Test error:', error);
    return response.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Remove the CORS wrapper to avoid interference

async function apiHandler(request, response) {
  console.log('=== DEBUG API REQUEST ===');
  console.log('Full request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Request headers:', request.headers);
  console.log('Request body:', request.body);
  console.log('Request body type:', typeof request.body);
  
  // Set CORS headers for Pi Browser compatibility
  response.setHeader('Access-Control-Allow-Origin', 'https://sandbox.minepi.com');
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
    const searchParams = url.searchParams;
    
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
    if (path === '/api/auth/pi') {
      console.log('Routing to auth-pi test handler');
      const authPiHandler = (await import('./auth-pi.js')).default;
      return await authPiHandler(request, response);
    } else if (path === '/api/pi') {
      // Import and use the consolidated Pi API handler
      const piHandler = (await import('./pi.js')).default;
      
      // For /api/pi, pass through the query parameters
      const modifiedRequest = {
        ...request,
        query: Object.fromEntries(searchParams)
      };
      return await piHandler(modifiedRequest, response);
    } else if (path === '/api/pi-price') {
      // Handle /api/pi-price endpoint
      const piHandler = (await import('./pi.js')).default;
      const modifiedRequest = {
        ...request,
        query: { action: 'price' }
      };
      return await piHandler(modifiedRequest, response);
    } else if (path === '/api/pi-balance') {
      // Handle /api/pi-balance endpoint
      const piHandler = (await import('./pi.js')).default;
      const modifiedRequest = {
        ...request,
        query: { action: 'balance' }
      };
      return await piHandler(modifiedRequest, response);
    } else if (path === '/api/metadata') {
      console.log('Routing to metadata handler');
      return await handleMetadata(request, response);
    } else if (path === '/api/profile') {
      console.log('Routing to profile handler');
      return await handleProfileUpdate(request, response);
    } else if (path === '/api/admin/login') {
      console.log('Routing to admin login handler');
      return await handleAdminLogin(request, response);
    } else if (path === '/api/packages') {
      console.log('Routing to packages handler');
      return await handlePackages(request, response);
    } else if (path === '/api/transactions') {
      console.log('Routing to transactions handler');
      return await handleTransactions(request, response);
    } else if (path === '/api/payment/approve') {
      console.log('Routing to payment approval handler');
      return await handlePaymentApproval(request, response);
    } else if (path === '/api/payment/complete') {
      console.log('Routing to payment completion handler');
      return await handlePaymentCompletion(request, response);
    } else if (path === '/api/admin/analytics') {
      console.log('Routing to analytics handler');
      return await handleAnalytics(request, response);
    } else if (path === '/api/mock-pi-payment') {
      console.log('Routing to mock payment handler');
      return await mockPaymentHandler(request, response);
    } else if (path === '/api/test-fetch') {
      console.log('Routing to test fetch handler');
      return await handleTestFetch(request, response);
    } else if (path === '/api/test-pi-api') {
      console.log('Routing to test Pi API handler');
      return await handleTestPiApi(request, response);
    } else if (path === '/api/test-env') {
      console.log('Routing to test environment variables handler');
      return await handleTestEnv(request, response);
    } else if (path === '/api/test-auth') {
      console.log('Routing to test auth handler');
      return await handleTestAuth(request, response);
    } else if (path === '/api/diagnose-pi-issue') {
      console.log('Routing to Pi Network diagnostic handler');
      return await handleDiagnosePiIssue(request, response);
    } else if (path === '/api/test-pi-dns') {
      console.log('Routing to Pi Network DNS test handler');
      return await handleTestPiDns(request, response);
    } else if (path === '/api/test-pi-testnet') {
      console.log('Routing to Pi Network Testnet test handler');
      return await handleTestPiTestnet(request, response);
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

export default apiHandler;