import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage, getPiNetworkService, getPricingService, getEmailService, jwt, bcrypt } from './_utils.ts';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret';

// Helper function to handle errors
function handleError(error: any, message: string = 'Internal Server Error') {
  console.error(message, error);
  return { status: 500, body: { message } };
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Debug logging
  console.log('API Handler called:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    query: request.query,
    body: request.body
  });
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    // Get services dynamically
    const storage = await getStorage();
    const piNetworkService = await getPiNetworkService();
    const pricingService = await getPricingService();
    const sendPurchaseConfirmationEmail = await getEmailService();

    // Route handling
    // Log the request URL for debugging
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    console.log('Request query:', request.query);
    
    // Extract the path from the URL for matching
    const urlPath = request.url || '';
    
    // Handle both full URLs and path-only URLs
    if (urlPath.includes('/api/users') || urlPath === '/users' || urlPath === '/api/users') {
      return handleUsers(request, response, storage, piNetworkService, jwt, bcrypt, JWT_SECRET);
    } else if (urlPath.includes('/api/packages') || urlPath === '/packages' || urlPath === '/api/packages') {
      return handlePackages(request, response, storage, pricingService);
    } else if (urlPath.includes('/api/transactions') || urlPath === '/transactions' || urlPath === '/api/transactions') {
      return handleTransactions(request, response, storage, jwt, JWT_SECRET);
    } else if (urlPath.includes('/api/payments') || urlPath === '/payments' || urlPath === '/api/payments') {
      return handlePayments(request, response, storage, piNetworkService, pricingService, sendPurchaseConfirmationEmail, JWT_SECRET);
    } else if (urlPath.includes('/api/pi-price') || urlPath === '/pi-price' || urlPath === '/api/pi-price') {
      return handlePiPrice(request, response, pricingService);
    } else if (urlPath.includes('/api/admin') || urlPath === '/admin' || urlPath === '/api/admin') {
      return handleAdmin(request, response, storage, jwt, bcrypt, JWT_SECRET);
    } else if (urlPath.includes('/api/health') || urlPath === '/health' || urlPath === '/api/health') {
      return handleHealth(request, response);
    } else {
      console.log('No route matched for URL:', request.url);
      console.log('Full request object:', { url: request.url, method: request.method, query: request.query, body: request.body });
      return response.status(404).json({ message: `Route not found for URL: ${request.url}`, url: request.url, method: request.method });
    }
  } catch (error) {
    console.error('API handler error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
}

// User handling
async function handleUsers(request: VercelRequest, response: VercelResponse, storage: any, piNetworkService: any, jwt: any, bcrypt: any, JWT_SECRET: string) {
  // Log for debugging
  console.log('Handling users request:', request.method, request.url, request.query, request.body);
  
  // Allow both POST and GET requests
  if (request.method !== 'POST' && request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  // For GET requests, we only support the 'me' action
  if (request.method === 'GET') {
    const { action } = request.query;
    
    if (action === 'me') {
      // Validate session token and return user data
      const sessionToken = request.headers.authorization?.replace('Bearer ', '');
      if (!sessionToken) {
        return response.status(401).json({ message: 'No token provided' });
      }

      try {
        const decoded = jwt.verify(sessionToken, JWT_SECRET) as any;
        const user = await storage.getUser(decoded.userId);
        if (!user) {
          return response.status(404).json({ message: 'User not found' });
        }

        return response.json({
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          country: user.country,
          language: user.language,
          gameAccounts: user.gameAccounts,
          walletAddress: user.walletAddress,
        });
      } catch (error) {
        return response.status(401).json({ message: 'Invalid token' });
      }
    } else {
      return response.status(400).json({ message: 'Invalid action for GET request' });
    }
  }

  // For POST requests, continue with existing logic
  const { action, data } = request.body;
  
  switch (action) {
    case 'authenticate':
      console.log('Handling authenticate action with data:', data);
      const { accessToken } = data;
      if (!accessToken) {
        return response.status(400).json({ message: 'Access token required' });
      }

      console.log('Verifying access token with Pi Network');
      const piUser = await piNetworkService.verifyAccessToken(accessToken);
      console.log('Pi Network verification result:', piUser);
      if (!piUser) {
        return response.status(401).json({ message: 'Invalid Pi Network token' });
      }

      // Check if user exists, if not create new user
      let user = await storage.getUserByPiUID(piUser.uid);
      if (!user) {
        // Create minimal user profile - they'll complete it later
        const newUser = {
          piUID: piUser.uid,
          username: piUser.username,
          email: '',
          phone: '',
          country: 'Bhutan',
          language: 'en',
          walletAddress: '', // Will be updated when they make their first transaction
        };
        user = await storage.createUser(newUser);
      }

      // Generate JWT token for session
      const userToken = jwt.sign({ userId: user.id, piUID: user.piUID }, JWT_SECRET, { expiresIn: '7d' });

      return response.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          country: user.country,
          language: user.language,
          gameAccounts: user.gameAccounts,
          walletAddress: user.walletAddress,
        },
        token: userToken,
      });

    case 'login':
      const { username, password } = data;
      if (!username || !password) {
        return response.status(400).json({ message: 'Username and password required' });
      }

      const admin = await storage.getAdminByUsername(username);
      if (!admin || !admin.isActive) {
        return response.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return response.status(401).json({ message: 'Invalid credentials' });
      }

      await storage.updateAdminLastLogin(admin.id);

      const adminToken = jwt.sign({ adminId: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });

      return response.json({
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
        token: adminToken,
      });

    case 'updateProfile':
      const profileToken = request.headers.authorization?.replace('Bearer ', '');
      if (!profileToken) {
        return response.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(profileToken, JWT_SECRET) as any;
      const userId = decoded.userId;

      const updateData = data;
      
      // Validate required fields
      if (updateData.email && !updateData.email.endsWith('@gmail.com')) {
        return response.status(400).json({ message: 'Email must be a Gmail address' });
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return response.status(404).json({ message: 'User not found' });
      }

      return response.json(updatedUser);

    default:
      return response.status(400).json({ message: 'Invalid action' });
  }
}

// Packages handling
async function handlePackages(request: VercelRequest, response: VercelResponse, storage: any, pricingService: any) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const packages = await storage.getActivePackages();
    const currentPiPrice = await pricingService.getCurrentPiPrice();

    const packagesWithPiPricing = packages.map((pkg: any) => ({
      ...pkg,
      piPrice: pricingService.calculatePiAmount(parseFloat(pkg.usdtValue)),
      currentPiPrice,
    }));

    response.json(packagesWithPiPricing);
  } catch (error) {
    console.error('Packages fetch error:', error);
    response.status(500).json({ message: 'Failed to fetch packages' });
  }
}

// Transactions handling
async function handleTransactions(request: VercelRequest, response: VercelResponse, storage: any, jwt: any, JWT_SECRET: string) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return response.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const transactions = await storage.getUserTransactions(userId);
    response.json(transactions);
  } catch (error) {
    console.error('Transactions fetch error:', error);
    response.status(500).json({ message: 'Failed to fetch transactions' });
  }
}

// Payments handling
async function handlePayments(request: VercelRequest, response: VercelResponse, storage: any, piNetworkService: any, pricingService: any, sendPurchaseConfirmationEmail: any, JWT_SECRET: string) {
  // Set CORS headers for this specific endpoint
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  const { action, data } = request.body;
  
  // Get API key from environment
  const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY || 'mock_pi_server_api_key_for_development';

  switch (action) {
    case 'approve':
      const { paymentId } = data;
      if (!paymentId) {
        return response.status(400).json({ message: 'Payment ID required' });
      }

      // Get payment details from Pi Network Testnet
      const payment = await piNetworkService.getPayment(paymentId, PI_SERVER_API_KEY);
      if (!payment) {
        return response.status(404).json({ message: 'Payment not found' });
      }

      // Validate payment metadata
      if (!payment.metadata?.type || payment.metadata.type !== 'backend') {
        return response.status(400).json({ message: 'Invalid payment metadata' });
      }

      // Check if transaction already exists
      let transaction = await storage.getTransactionByPaymentId(paymentId);
      if (!transaction) {
        // Create new transaction record
        const currentPiPrice = await pricingService.getCurrentPiPrice();
        const usdAmount = pricingService.calculateUsdAmount(payment.amount);

        const transactionData = {
          userId: payment.metadata.userId,
          packageId: payment.metadata.packageId,
          paymentId: payment.identifier,
          piAmount: payment.amount.toString(),
          usdAmount: usdAmount.toString(),
          piPriceAtTime: currentPiPrice.toString(),
          status: 'pending',
          gameAccount: payment.metadata.gameAccount,
          metadata: payment.metadata,
        };

        transaction = await storage.createTransaction(transactionData);
      }

      // Approve payment with Pi Network Testnet
      const approved = await piNetworkService.approvePayment(paymentId, PI_SERVER_API_KEY);
      if (!approved) {
        await storage.updateTransaction(transaction.id, { status: 'failed' });
        return response.status(500).json({ message: 'Payment approval failed' });
      }

      // Update transaction status
      await storage.updateTransaction(transaction.id, { status: 'approved' });

      return response.json({ success: true, transactionId: transaction.id });

    case 'complete':
      const { paymentId: completePaymentId, txid } = data;
      if (!completePaymentId || !txid) {
        return response.status(400).json({ message: 'Payment ID and txid required' });
      }

      const completeTransaction = await storage.getTransactionByPaymentId(completePaymentId);
      if (!completeTransaction) {
        return response.status(404).json({ message: 'Transaction not found' });
      }

      // Complete payment with Pi Network Testnet
      const completed = await piNetworkService.completePayment(completePaymentId, txid, PI_SERVER_API_KEY);
      if (!completed) {
        await storage.updateTransaction(completeTransaction.id, { status: 'failed' });
        return response.status(500).json({ message: 'Payment completion failed' });
      }

      // Update transaction with txid and completed status
      await storage.updateTransaction(completeTransaction.id, { 
        status: 'completed', 
        txid: txid,
      });

      // Update user's wallet address if not already set
      const user = await storage.getUser(completeTransaction.userId);
      if (user && !user.walletAddress) {
        await storage.updateUser(user.id, { 
          walletAddress: payment.from_address || '' 
        });
      }

      // Send confirmation email
      try {
        const user = await storage.getUser(completeTransaction.userId);
        const pkg = await storage.getPackage(completeTransaction.packageId);
        
        if (user && pkg && user.email) {
          const gameAccountString = completeTransaction.gameAccount.ign 
            ? `${completeTransaction.gameAccount.ign} (${completeTransaction.gameAccount.uid})`
            : `${completeTransaction.gameAccount.userId}:${completeTransaction.gameAccount.zoneId}`;

          const emailSent = await sendPurchaseConfirmationEmail({
            to: user.email,
            username: user.username,
            packageName: pkg.name,
            piAmount: completeTransaction.piAmount,
            usdAmount: completeTransaction.usdAmount,
            gameAccount: gameAccountString,
            transactionId: completeTransaction.id,
            paymentId: completePaymentId,
            isTestnet: true, // Always testnet
          });

          await storage.updateTransaction(completeTransaction.id, { emailSent });
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the transaction if email fails
      }

      return response.json({ success: true, transactionId: completeTransaction.id, txid });

    default:
      return response.status(400).json({ message: 'Invalid action' });
  }
}

// Pi Price handling
async function handlePiPrice(request: VercelRequest, response: VercelResponse, pricingService: any) {
  // Set CORS headers for this specific endpoint
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const price = await pricingService.getCurrentPiPrice();
    const lastPrice = pricingService.getLastPrice();
    
    const result = {
      price,
      lastUpdated: lastPrice?.lastUpdated ? new Date(lastPrice.lastUpdated).toISOString() : new Date().toISOString(),
    };
    
    console.log('Pi price response:', result);
    response.json(result);
  } catch (error) {
    console.error('Pi price fetch error:', error);
    response.status(500).json({ message: 'Failed to fetch Pi price', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

// Admin handling
async function handleAdmin(request: VercelRequest, response: VercelResponse, storage: any, jwt: any, bcrypt: any, JWT_SECRET: string) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  const { action, data } = request.body;
  
  // Authenticate admin
  const token = request.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return response.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const admin = await storage.getAdminByUsername(decoded.username);
    if (!admin || !admin.isActive) {
      return response.status(401).json({ message: 'Invalid admin token' });
    }
  } catch (error) {
    return response.status(401).json({ message: 'Invalid token' });
  }

  switch (action) {
    case 'analytics':
      const analytics = await storage.getAnalytics();
      return response.json(analytics);

    case 'transactions':
      const transactions = await storage.getAllTransactions();
      return response.json(transactions);

    case 'packages':
      const packages = await storage.getPackages();
      return response.json(packages);

    case 'createPackage':
      // Note: You might need to import zod validation here
      const newPackage = await storage.createPackage(data);
      return response.json(newPackage);

    case 'updatePackage':
      const { id, updateData } = data;
      const updatedPackage = await storage.updatePackage(id, updateData);
      
      if (!updatedPackage) {
        return response.status(404).json({ message: 'Package not found' });
      }
      
      return response.json(updatedPackage);

    default:
      return response.status(400).json({ message: 'Invalid action' });
  }
}

// Health check handling
async function handleHealth(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  response.json({ status: 'ok', timestamp: new Date().toISOString() });
}