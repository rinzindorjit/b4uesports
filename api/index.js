// Main API handler for Vercel
import authHandler from './pi/auth.js';
import paymentsHandler from './pi/payments.js';
import userHandler from './pi/user.js';
import webhookHandler from './pi/webhook.js';
import metadataHandler from './metadata.js';
import mockPaymentHandler from './pi/mock-payment.js';

// Remove the mock handleAuthPi function and use the imported authHandler instead

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

// Mock handler for Pi price
async function handlePiPrice(request, response) {
  // For mock purposes, return a mock Pi price
  const mockPrice = {
    price: 0.0001 + Math.random() * 0.001, // Random price between 0.0001 and 0.0011
    lastUpdated: new Date().toISOString(),
  };

  response.status(200).json(mockPrice);
}

// Mock handler for Pi balance
async function handlePiBalance(request, response) {
  // For mock purposes, return a mock Pi balance
  const mockBalance = {
    balance: Math.random() * 1000 + 100, // Random balance between 100-1100 Pi
    currency: 'π',
    lastUpdated: new Date().toISOString(),
    isTestnet: true
  };

  response.status(200).json(mockBalance);
}

// Mock handler for packages
async function handlePackages(request, response) {
  // For mock purposes, return mock packages
  const mockPackages = [
    {
      id: 'package-1',
      name: 'Starter Pack',
      description: 'Perfect for beginners',
      usdtValue: '5.00',
      piPrice: (5.00 / 0.0005).toString(), // Assuming 0.0005 USD per Pi
      currentPiPrice: 0.0005,
      gameCurrency: '1000 UC',
      game: 'pubg',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'package-2',
      name: 'Pro Pack',
      description: 'Great value for experienced players',
      usdtValue: '10.00',
      piPrice: (10.00 / 0.0005).toString(),
      currentPiPrice: 0.0005,
      gameCurrency: '2500 Diamonds',
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
      packageId: 'package-1',
      paymentId: 'payment-123',
      piAmount: '10000',
      usdAmount: '5.00',
      piPriceAtTime: '0.0005',
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

export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  // Extract the path from the request
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const path = url.pathname;
    
    console.log('=== DEBUG API REQUEST ===');
    console.log('Full request URL:', request.url);
    console.log('Parsed path:', path);
    console.log('Request method:', request.method);
    console.log('Request headers:', request.headers);
    console.log('Request body:', request.body);
    console.log('Host header:', request.headers.host);
    console.log('=== END DEBUG ===');
    
    // Log request body for debugging
    console.log('Request body:', request.body);
    console.log('Request body type:', typeof request.body);
    
    // Route to appropriate handler based on path
    if (path === '/api/pi/auth') {
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
    } else if (path === '/api/auth/pi') {
      console.log('Routing to auth/pi handler - using Pi auth handler');
      return await authHandler(request, response);
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