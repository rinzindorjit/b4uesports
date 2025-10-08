import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret';

// Mock storage for development/testing
const mockUsers: any[] = [];
const mockPackages: any[] = [];
const mockTransactions: any[] = [];
const mockAdmins: any[] = [];

// Initialize default admin
function initializeMockAdmin() {
  if (mockAdmins.length === 0) {
    const hashedPassword = '$2b$10$nl1.TXf.KMXSeDczktt9yerr1XjYgJWzKGnsP8fL7Vsqrzs2im4Hi';
    mockAdmins.push({
      id: 'admin_1',
      username: 'admin',
      password: hashedPassword,
      email: 'admin@b4uesports.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
    });
  }
}

initializeMockAdmin();

// Mock services
class MockPiNetworkService {
  async verifyAccessToken(accessToken: string) {
    // Mock implementation - in real implementation, this would call Pi Network API
    return {
      uid: 'mock_user_123',
      username: 'mockuser',
    };
  }
}

class MockPricingService {
  lastPrice: { price: number; lastUpdated: Date } | null = null;
  
  async getCurrentPiPrice() {
    // Mock implementation - return fixed price for testing
    return 0.24069;
  }
  
  calculatePiAmount(usdtValue: number) {
    const piPrice = 0.24069;
    return parseFloat((usdtValue / piPrice).toFixed(8));
  }
  
  calculateUsdAmount(piAmount: number) {
    const piPrice = 0.24069;
    return parseFloat((piAmount * piPrice).toFixed(4));
  }
  
  getLastPrice() {
    return this.lastPrice;
  }
}

const piNetworkService = new MockPiNetworkService();
const pricingService = new MockPricingService();

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Debug logging
  console.log('=== API Handler Debug Info ===');
  console.log('Raw request.url:', request.url);
  console.log('Request method:', request.method);
  console.log('Request headers:', request.headers);
  console.log('Request query:', request.query);
  console.log('Request body:', request.body);
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return response.status(200).end();
  }

  try {
    // Extract the path from the URL for matching
    let urlPath = request.url || '';
    console.log('Original urlPath:', urlPath);
    
    // Handle full URLs by extracting just the path
    if (urlPath.startsWith('http')) {
      try {
        const urlObj = new URL(urlPath);
        urlPath = urlObj.pathname;
        console.log('Extracted path from full URL:', urlPath);
      } catch (e) {
        console.log('Failed to parse full URL, using as-is');
      }
    }
    
    // Remove trailing slashes and /api prefix if present
    urlPath = urlPath.replace(/\/$/, ''); // Remove trailing slash
    if (urlPath.startsWith('/api')) {
      urlPath = urlPath.substring(4); // Remove /api prefix
      console.log('Removed /api prefix, new path:', urlPath);
    }
    
    console.log('Final processed urlPath:', urlPath);
    
    // Simple route matching
    if (urlPath === '/users' || urlPath === '') {
      console.log('Routing to handleUsers');
      return handleUsers(request, response);
    } else if (urlPath === '/packages') {
      console.log('Routing to handlePackages');
      return handlePackages(request, response);
    } else if (urlPath === '/transactions') {
      console.log('Routing to handleTransactions');
      return handleTransactions(request, response);
    } else if (urlPath === '/payments') {
      console.log('Routing to handlePayments');
      return handlePayments(request, response);
    } else if (urlPath === '/pi-price') {
      console.log('Routing to handlePiPrice');
      return handlePiPrice(request, response);
    } else if (urlPath === '/admin') {
      console.log('Routing to handleAdmin');
      return handleAdmin(request, response);
    } else if (urlPath === '/health') {
      console.log('Routing to handleHealth');
      return handleHealth(request, response);
    } else {
      console.log('No route matched, returning 404');
      console.log('Request details:', { url: request.url, method: request.method, path: urlPath });
      return response.status(404).json({ 
        message: `Route not found for path: ${urlPath}`, 
        path: urlPath, 
        method: request.method,
        availableRoutes: ['/users', '/packages', '/transactions', '/payments', '/pi-price', '/admin', '/health']
      });
    }
  } catch (error) {
    console.error('API handler error:', error);
    return response.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// User handling
async function handleUsers(request: VercelRequest, response: VercelResponse) {
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
        const user = mockUsers.find(u => u.id === decoded.userId);
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
      let user = mockUsers.find(u => u.piUID === piUser.uid);
      if (!user) {
        // Create minimal user profile - they'll complete it later
        const newUser = {
          id: `user_${mockUsers.length + 1}`,
          piUID: piUser.uid,
          username: piUser.username,
          email: '',
          phone: '',
          country: 'Bhutan',
          language: 'en',
          walletAddress: '', // Will be updated when they make their first transaction
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockUsers.push(newUser);
        user = newUser;
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

      const admin = mockAdmins.find(a => a.username === username);
      if (!admin || !admin.isActive) {
        return response.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return response.status(401).json({ message: 'Invalid credentials' });
      }

      admin.lastLogin = new Date();

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

      const userToUpdate = mockUsers.find(u => u.id === userId);
      if (!userToUpdate) {
        return response.status(404).json({ message: 'User not found' });
      }

      Object.assign(userToUpdate, updateData, { updatedAt: new Date() });
      return response.json(userToUpdate);

    default:
      return response.status(400).json({ message: 'Invalid action' });
  }
}

// Packages handling
async function handlePackages(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const currentPiPrice = await pricingService.getCurrentPiPrice();

    const packagesWithPiPricing = mockPackages.map((pkg: any) => ({
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
async function handleTransactions(request: VercelRequest, response: VercelResponse) {
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

    const transactions = mockTransactions.filter(tx => tx.userId === userId);
    response.json(transactions);
  } catch (error) {
    console.error('Transactions fetch error:', error);
    response.status(500).json({ message: 'Failed to fetch transactions' });
  }
}

// Payments handling
async function handlePayments(request: VercelRequest, response: VercelResponse) {
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
  
  switch (action) {
    case 'approve':
      const { paymentId } = data;
      if (!paymentId) {
        return response.status(400).json({ message: 'Payment ID required' });
      }

      // Mock payment approval
      return response.json({ success: true, transactionId: `tx_${Date.now()}` });

    case 'complete':
      const { paymentId: completePaymentId, txid } = data;
      if (!completePaymentId || !txid) {
        return response.status(400).json({ message: 'Payment ID and txid required' });
      }

      // Mock payment completion
      return response.json({ success: true, transactionId: `tx_${Date.now()}`, txid });

    default:
      return response.status(400).json({ message: 'Invalid action' });
  }
}

// Pi Price handling
async function handlePiPrice(request: VercelRequest, response: VercelResponse) {
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
async function handleAdmin(request: VercelRequest, response: VercelResponse) {
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
    const admin = mockAdmins.find(a => a.username === decoded.username);
    if (!admin || !admin.isActive) {
      return response.status(401).json({ message: 'Invalid admin token' });
    }
  } catch (error) {
    return response.status(401).json({ message: 'Invalid token' });
  }

  switch (action) {
    case 'analytics':
      return response.json({
        totalUsers: mockUsers.length,
        totalTransactions: mockTransactions.length,
        totalRevenue: 0,
        successRate: 100
      });

    case 'transactions':
      const transactionsWithDetails = mockTransactions.map(tx => ({
        ...tx,
        user: mockUsers.find(u => u.id === tx.userId) || mockUsers[0],
        package: mockPackages.find(p => p.id === tx.packageId) || mockPackages[0]
      }));
      return response.json(transactionsWithDetails);

    case 'packages':
      return response.json(mockPackages);

    case 'createPackage':
      const newPackage = {
        ...data,
        id: `pkg_${mockPackages.length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockPackages.push(newPackage);
      return response.json(newPackage);

    case 'updatePackage':
      const { id, updateData } = data;
      const packageToUpdate = mockPackages.find(p => p.id === id);
      
      if (!packageToUpdate) {
        return response.status(404).json({ message: 'Package not found' });
      }
      
      Object.assign(packageToUpdate, updateData, { updatedAt: new Date() });
      return response.json(packageToUpdate);

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