import { Express, Request, Response } from 'express';
import { jwt } from './_utils.js';

// Mock storage for Vercel environment
let mockStorage = {
  users: {} as Record<string, any>,
  transactions: [] as any[],
  packages: {} as Record<string, any>
};

// Mock Pi Network service for Vercel environment
const mockPiNetworkService = {
  verifyAccessToken: async (accessToken: string) => {
    // Mock implementation - in a real environment, this would verify with Pi Network API
    return {
      uid: 'mock-user-id',
      username: 'mock-user'
    };
  },
  approvePayment: async (paymentId: string, apiKey: string) => {
    // Mock implementation
    return true;
  },
  completePayment: async (paymentId: string, txid: string, apiKey: string) => {
    // Mock implementation
    return true;
  }
};

// Mock pricing service for Vercel environment
const mockPricingService = {
  getCurrentPiPrice: async () => {
    // Mock implementation - return a fixed price
    return 0.24069;
  },
  calculatePiAmount: (usdtValue: number) => {
    // Mock implementation
    return usdtValue / 0.24069;
  }
};

// Mock email service for Vercel environment
const mockEmailService = {
  sendPurchaseConfirmationEmail: async (email: string, purchaseDetails: any) => {
    // Mock implementation
    console.log('Mock email sent to:', email);
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

              const piUser = await mockPiNetworkService.verifyAccessToken(accessToken);
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
            {
              id: '1',
              name: 'PUBG Mobile 60UC',
              description: '60 Unknown Cash for PUBG Mobile',
              game: 'pubg',
              usdtValue: '1.00',
              image: '/images/pubg-small.jpg'
            },
            {
              id: '2',
              name: 'PUBG Mobile 325UC',
              description: '325 Unknown Cash for PUBG Mobile',
              game: 'pubg',
              usdtValue: '5.00',
              image: '/images/pubg-medium.jpg'
            },
            {
              id: '3',
              name: 'PUBG Mobile 660UC',
              description: '660 Unknown Cash for PUBG Mobile',
              game: 'pubg',
              usdtValue: '10.00',
              image: '/images/pubg-large.jpg'
            },
            {
              id: '4',
              name: 'MLBB 74 Diamonds',
              description: '74 Diamonds for Mobile Legends: Bang Bang',
              game: 'mlbb',
              usdtValue: '1.00',
              image: '/images/mlbb-small.jpg'
            },
            {
              id: '5',
              name: 'MLBB 376 Diamonds',
              description: '376 Diamonds for Mobile Legends: Bang Bang',
              game: 'mlbb',
              usdtValue: '5.00',
              image: '/images/mlbb-medium.jpg'
            },
            {
              id: '6',
              name: 'MLBB 774 Diamonds',
              description: '774 Diamonds for Mobile Legends: Bang Bang',
              game: 'mlbb',
              usdtValue: '10.00',
              image: '/images/mlbb-large.jpg'
            }
          ];
          
          const currentPiPrice = await mockPricingService.getCurrentPiPrice();

          const packagesWithPiPricing = packages.map((pkg: any) => ({
            ...pkg,
            piPrice: mockPricingService.calculatePiAmount(parseFloat(pkg.usdtValue)),
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
        
        try {
          switch (action) {
            case 'approve':
              // Server-Side Approval as required by Pi Network
              // In a real implementation, you would look up the payment in your database
              // For this mock implementation, we'll just approve it
              const approved = await mockPiNetworkService.approvePayment(data.paymentId, PI_SERVER_API_KEY || '');
              if (!approved) {
                return res.status(500).json({ message: 'Failed to approve payment with Pi Network' });
              }
              
              return res.json({ message: 'Payment approved' });

            case 'complete':
              // Server-Side Completion as required by Pi Network
              // In a real implementation, you would look up the payment in your database
              // For this mock implementation, we'll just complete it
              const completed = await mockPiNetworkService.completePayment(data.paymentId, data.txid, PI_SERVER_API_KEY || '');
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
          
          const price = await mockPricingService.getCurrentPiPrice();

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