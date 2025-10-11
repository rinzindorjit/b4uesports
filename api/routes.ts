import { Express, Request, Response } from 'express';
import { jwt } from './_utils.js';
import axios from 'axios';

// Determine if we're in sandbox (Testnet) mode
// Safely check for environment variables
const isSandbox = (process.env.PI_SANDBOX === 'true') || (process.env.NODE_ENV !== 'production');
const PI_API_BASE_URL = isSandbox ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';

console.log(`Pi Network service initialized in ${isSandbox ? 'SANDBOX (Testnet)' : 'PRODUCTION (Mainnet)'} mode`);

// Mock storage for Vercel environment
let mockStorage = {
  users: {} as Record<string, any>,
  transactions: [] as any[],
  packages: {} as Record<string, any>
};

// Real Pi Network service for Vercel environment
const piNetworkService = {
  verifyAccessToken: async (accessToken: string) => {
    try {
      const res = await axios.get(`${PI_API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        // Add timeout to prevent hanging
        timeout: 10000, // 10 second timeout
      });

      if (!res.status.toString().startsWith('2')) {
        console.error(`Pi ${isSandbox ? 'Testnet' : 'Mainnet'} /me failed:`, res.statusText);
        return null;
      }

      const user = res.data;
      console.log(`Pi ${isSandbox ? 'Testnet' : 'Mainnet'} verified user:`, user);
      return user;
    } catch (error: any) {
      console.error(`Pi ${isSandbox ? 'Testnet' : 'Mainnet'} verification error:`, error.response?.data || error.message);
      return null;
    }
  },
  
  // Payment approval method
  approvePayment: async (paymentId: string, apiKey: string) => {
    try {
      const response = await axios.post(
        `${PI_API_BASE_URL}/payments/${paymentId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
          },
          // Add timeout to prevent hanging
          timeout: 10000, // 10 second timeout
        }
      );
      
      console.log(`✅ Payment approved on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId);
      return true;
    } catch (error: any) {
      console.error('Payment approval failed:', error.response?.data || error.message);
      return false;
    }
  },

  // Payment completion method
  completePayment: async (paymentId: string, txid: string, apiKey: string) => {
    try {
      const response = await axios.post(
        `${PI_API_BASE_URL}/payments/${paymentId}/complete`,
        { txid },
        {
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
          },
          // Add timeout to prevent hanging
          timeout: 10000, // 10 second timeout
        }
      );
      
      console.log(`✅ Payment completed on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId, "TXID:", txid);
      return true;
    } catch (error: any) {
      console.error('Payment completion failed:', error.response?.data || error.message);
      return false;
    }
  }
};

// Real pricing service for Vercel environment
const pricingService = {
  getCurrentPiPrice: async () => {
    try {
      // Use CoinGecko API to get the current Pi price with demo key
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4', {
        timeout: 5000 // 5 second timeout
      });
      
      const price = response.data['pi-network']?.usd;
      
      if (typeof price !== 'number') {
        throw new Error('Invalid price data received from CoinGecko');
      }
      
      return price;
    } catch (error) {
      console.error('Failed to fetch Pi price from CoinGecko:', error);
      
      // Fallback to fixed price if API fails
      const fixedPrice = 0.24069;
      return fixedPrice;
    }
  },
  calculatePiAmount: function(usdtValue: number) {
    // Use the last fetched price or fallback to fixed price
    return usdtValue / 0.24069;
  }
};

// JWT secret for Vercel environment
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function registerRoutes(app: Express): Promise<void> {
  // Add a timeout to prevent hanging
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Route registration timed out'));
    }, 10000); // 10 second timeout for route registration
    
    try {
      // Health check endpoint
      app.get('/api/health', async (req: Request, res: Response) => {
        try {
          res.json({ 
            status: "ok", 
            timestamp: new Date().toISOString(),
            message: "B4U Esports API is running"
          });
        } catch (error) {
          console.error('Health check error:', error);
          res.status(500).json({ message: 'Health check failed' });
        }
      });
      
      // Consolidated API endpoint for user operations
      app.post('/api/users', async (req: Request, res: Response) => {
        console.log('Received POST request to /api/users with action:', req.body?.action);
        console.log('Request headers:', req.headers);
        console.log('Request body:', req.body);
        
        const { action, data } = req.body;
        
        try {
          switch (action) {
            case 'authenticate':
              console.log('Processing authenticate action');
              const { accessToken } = data;
              if (!accessToken) {
                return res.status(400).json({ message: 'Access token required' });
              }

              const piUser = await piNetworkService.verifyAccessToken(accessToken);
              if (!piUser) {
                return res.status(401).json({ message: 'Invalid Pi Network token' });
              }

              // Check if user exists, if not create new user
              let user = mockStorage.users[piUser.uid];
              if (!user) {
                // Create minimal user profile - they'll complete it later
                const newUser = {
                  id: piUser.uid,
                  piUID: piUser.uid,
                  username: piUser.username,
                  email: '',
                  phone: '',
                  country: 'Bhutan',
                  language: 'en',
                  walletAddress: '', // Will be updated when they make their first transaction
                  gameAccounts: {}
                };
                mockStorage.users[piUser.uid] = newUser;
                user = newUser;
              }

              // Generate JWT token for session
              const userToken = jwt.sign({ userId: user.id, piUID: user.piUID }, JWT_SECRET, { expiresIn: '7d' });

              return res.json({
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

            default:
              console.log('Invalid action:', action);
              return res.status(400).json({ message: 'Invalid action' });
          }
        } catch (error) {
          console.error('User operation error:', error);
          return res.status(500).json({ message: 'User operation failed' });
        }
      });

      // Get current user
      app.get('/api/users', async (req: Request, res: Response) => {
        try {
          const { action } = req.query;
          
          if (action === 'me') {
            const token = req.headers.authorization?.replace('Bearer ', '');
            if (!token) {
              return res.status(401).json({ message: 'No token provided' });
            }

            const decoded = jwt.verify(token, JWT_SECRET) as any;
            const user = mockStorage.users[decoded.piUID];
            if (!user) {
              return res.status(404).json({ message: 'User not found' });
            }

            return res.json({
              id: user.id,
              username: user.username,
              email: user.email,
              phone: user.phone,
              country: user.country,
              language: user.language,
              gameAccounts: user.gameAccounts,
              walletAddress: user.walletAddress,
            });
          } else {
            return res.status(400).json({ message: 'Invalid action' });
          }
        } catch (error) {
          console.error('Get user error:', error);
          return res.status(500).json({ message: 'Failed to get user' });
        }
      });

      // Consolidated API endpoint for package operations
      app.get('/api/packages', async (req: Request, res: Response) => {
        // Add CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          return res.status(200).end();
        }
        
        try {
          const packages = [
            // PUBG Packages
            { id: 'pubg-60', game: 'PUBG', name: '60 UC', inGameAmount: 60, usdtValue: '1.5000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 6 },
            { id: 'pubg-325', game: 'PUBG', name: '325 UC', inGameAmount: 325, usdtValue: '6.5000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 27 },
            { id: 'pubg-660', game: 'PUBG', name: '660 UC', inGameAmount: 660, usdtValue: '12.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 50 },
            { id: 'pubg-1800', game: 'PUBG', name: '1800 UC', inGameAmount: 1800, usdtValue: '25.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 104 },
            { id: 'pubg-3850', game: 'PUBG', name: '3850 UC', inGameAmount: 3850, usdtValue: '49.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 204 },
            { id: 'pubg-8100', game: 'PUBG', name: '8100 UC', inGameAmount: 8100, usdtValue: '96.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 399 },
            { id: 'pubg-16200', game: 'PUBG', name: '16200 UC', inGameAmount: 16200, usdtValue: '186.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 773 },
            { id: 'pubg-24300', game: 'PUBG', name: '24300 UC', inGameAmount: 24300, usdtValue: '278.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 1155 },
            { id: 'pubg-32400', game: 'PUBG', name: '32400 UC', inGameAmount: 32400, usdtValue: '369.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 1533 },
            { id: 'pubg-40500', game: 'PUBG', name: '40500 UC', inGameAmount: 40500, usdtValue: '459.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 1907 },
            
            // MLBB Packages
            { id: 'mlbb-56', game: 'MLBB', name: '56 Diamonds', inGameAmount: 56, usdtValue: '3.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 12 },
            { id: 'mlbb-278', game: 'MLBB', name: '278 Diamonds', inGameAmount: 278, usdtValue: '6.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 25 },
            { id: 'mlbb-571', game: 'MLBB', name: '571 Diamonds', inGameAmount: 571, usdtValue: '11.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 46 },
            { id: 'mlbb-1783', game: 'MLBB', name: '1783 Diamonds', inGameAmount: 1783, usdtValue: '33.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 137 },
            { id: 'mlbb-3005', game: 'MLBB', name: '3005 Diamonds', inGameAmount: 3005, usdtValue: '52.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 216 },
            { id: 'mlbb-6012', game: 'MLBB', name: '6012 Diamonds', inGameAmount: 6012, usdtValue: '99.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 411 },
            { id: 'mlbb-12000', game: 'MLBB', name: '12000 Diamonds', inGameAmount: 12000, usdtValue: '200.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 831 }
          ];
          
          const currentPiPrice = await pricingService.getCurrentPiPrice();

          const packagesWithPiPricing = packages.map((pkg: any) => ({
            ...pkg,
            piPrice: pricingService.calculatePiAmount(parseFloat(pkg.usdtValue)),
            currentPiPrice: currentPiPrice,
          }));

          res.json(packagesWithPiPricing);
        } catch (error) {
          console.error('Packages fetch error:', error);
          res.status(500).json({ message: 'Failed to fetch packages' });
        }
      });

      // Consolidated API endpoint for payment operations
      app.post('/api/payments', async (req: Request, res: Response) => {
        const { action, data } = req.body;
        const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY;
        
        // Check if PI_SERVER_API_KEY is configured
        if (!PI_SERVER_API_KEY) {
          console.error('PI_SERVER_API_KEY is not configured in environment variables');
          return res.status(500).json({ 
            message: 'Payment service not properly configured. Please contact administrator.' 
          });
        }
        
        try {
          switch (action) {
            case 'approve':
              // Server-Side Approval as required by Pi Network
              // Validate required data
              if (!data || !data.paymentId) {
                return res.status(400).json({ message: "paymentId is required" });
              }

              const { paymentId } = data;
              
              console.log('Approving payment: ' + paymentId);

              // Approve payment with Pi Network
              const approved = await piNetworkService.approvePayment(data.paymentId, PI_SERVER_API_KEY);
              if (!approved) {
                return res.status(500).json({ message: 'Failed to approve payment with Pi Network' });
              }
              
              return res.json({ message: 'Payment approved' });

            case 'complete':
              // Server-Side Completion as required by Pi Network
              // Validate required data
              if (!data || !data.paymentId || !data.txid) {
                return res.status(400).json({ 
                  message: "paymentId and txid are required for completion" 
                });
              }

              const { paymentId: completePaymentId, txid } = data;
              
              console.log('Completing payment: ' + completePaymentId + ' with txid: ' + txid);

              // Complete payment with Pi Network
              const completed = await piNetworkService.completePayment(data.paymentId, data.txid, PI_SERVER_API_KEY);
              if (!completed) {
                return res.status(500).json({ message: 'Failed to complete payment with Pi Network' });
              }
              
              return res.json({ message: 'Payment completed' });
              
            default:
              return res.status(400).json({ message: 'Invalid action' });
          }
        } catch (error) {
          console.error('Payment operation error:', error);
          return res.status(500).json({ message: 'Payment operation failed' });
        }
      });

      // Pi Network price endpoint
      app.get('/api/pi-price', async (req: Request, res: Response) => {
        try {
          // Add CORS headers
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          
          // Handle preflight requests
          if (req.method === 'OPTIONS') {
            return res.status(200).end();
          }
          
          const price = await pricingService.getCurrentPiPrice();

          // Always return valid JSON
          return res.status(200).json({
            price,
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          // Log errors outside the response body
          console.error("Failed to fetch Pi price:", error);
          
          // Fallback to fixed price if API fails - always return valid JSON
          const fixedPrice = 0.24069;
          return res.status(200).json({
            price: fixedPrice,
            lastUpdated: new Date().toISOString(),
          });
        }
      });
      
      // Clear timeout and resolve promise
      clearTimeout(timeout);
      resolve();
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}