import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret';

// Dynamic import functions for Vercel compatibility
async function getStorage() {
  // Use relative paths that work in both environments
  try {
    // Try to import from the server directory (works in Vercel)
    const storageModule = await import("../server/storage");
    return storageModule.storage;
  } catch (error) {
    try {
      // Additional fallback for direct relative import (works in some cases)
      const storageModule = await import("./storage");
      return storageModule.storage;
    } catch (fallbackError) {
      // Final fallback - rethrow original error
      console.error('Failed to import storage module:', error);
      throw error;
    }
  }
}

async function getPiNetworkService() {
  try {
    // Try to import from the server directory (works in Vercel)
    const piNetworkModule = await import("../server/services/pi-network");
    return piNetworkModule.piNetworkService;
  } catch (error) {
    try {
      // Additional fallback for direct relative import (works in some cases)
      const piNetworkModule = await import("./services/pi-network");
      return piNetworkModule.piNetworkService;
    } catch (fallbackError) {
      // Final fallback - rethrow original error
      console.error('Failed to import Pi Network service:', error);
      throw error;
    }
  }
}

async function getPricingService() {
  try {
    // Try to import from the server directory (works in Vercel)
    const pricingModule = await import("../server/services/pricing");
    return pricingModule.pricingService;
  } catch (error) {
    try {
      // Additional fallback for direct relative import (works in some cases)
      const pricingModule = await import("./services/pricing");
      return pricingModule.pricingService;
    } catch (fallbackError) {
      // Final fallback - rethrow original error
      console.error('Failed to import pricing service:', error);
      throw error;
    }
  }
}

async function getEmailService() {
  try {
    // Try to import from the server directory (works in Vercel)
    const emailModule = await import("../server/services/email");
    return emailModule.sendPurchaseConfirmationEmail;
  } catch (error) {
    try {
      // Additional fallback for direct relative import (works in some cases)
      const emailModule = await import("./services/email");
      return emailModule.sendPurchaseConfirmationEmail;
    } catch (fallbackError) {
      // Final fallback - rethrow original error
      console.error('Failed to import email service:', error);
      throw error;
    }
  }
}

export async function registerRoutes(app: Express): Promise<void> {
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
      const storage = await getStorage();
      const piNetworkService = await getPiNetworkService();
      
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

        case 'updateProfile':
          console.log('Processing updateProfile action');
          const profileToken = req.headers.authorization?.replace('Bearer ', '');
          console.log('Profile token:', profileToken);
          
          if (!profileToken) {
            console.log('No token provided in request');
            return res.status(401).json({ message: 'No token provided' });
          }

          let decoded;
          try {
            decoded = jwt.verify(profileToken, JWT_SECRET) as any;
            console.log('Decoded token:', decoded);
          } catch (tokenError) {
            console.log('Invalid token error:', tokenError);
            return res.status(401).json({ message: 'Invalid token' });
          }
          
          const userId = decoded.userId;
          console.log('User ID from token:', userId);

          const updateData = data;
          console.log('Update data:', updateData);
          
          // Validate required fields
          if (!updateData.email || !updateData.phone || !updateData.country) {
            console.log('Missing required fields');
            return res.status(400).json({ message: 'Email, phone, and country are required' });
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(updateData.email)) {
            console.log('Invalid email format');
            return res.status(400).json({ message: 'Invalid email format' });
          }

          // Validate phone format (allow only numbers and common separators)
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(updateData.phone)) {
            console.log('Invalid phone number format');
            return res.status(400).json({ message: 'Invalid phone number format' });
          }

          // Validate game accounts if provided
          if (updateData.gameAccounts) {
            if (updateData.gameAccounts.pubg) {
              if (!updateData.gameAccounts.pubg.ign || !updateData.gameAccounts.pubg.uid) {
                console.log('PUBG IGN and UID are required');
                return res.status(400).json({ message: 'PUBG IGN and UID are required' });
              }
              // Validate UID is numeric
              if (!/^\d+$/.test(updateData.gameAccounts.pubg.uid)) {
                console.log('PUBG UID must be numeric');
                return res.status(400).json({ message: 'PUBG UID must be numeric' });
              }
            }
            
            if (updateData.gameAccounts.mlbb) {
              if (!updateData.gameAccounts.mlbb.userId || !updateData.gameAccounts.mlbb.zoneId) {
                console.log('MLBB User ID and Zone ID are required');
                return res.status(400).json({ message: 'MLBB User ID and Zone ID are required' });
              }
              // Validate IDs are numeric
              if (!/^\d+$/.test(updateData.gameAccounts.mlbb.userId) || !/^\d+$/.test(updateData.gameAccounts.mlbb.zoneId)) {
                console.log('MLBB User ID and Zone ID must be numeric');
                return res.status(400).json({ message: 'MLBB User ID and Zone ID must be numeric' });
              }
            }
          }

          console.log('Updating user with data:', updateData);
          const updatedUser = await storage.updateUser(userId, updateData);
          if (!updatedUser) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
          }

          return res.json({
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            phone: updatedUser.phone,
            country: updatedUser.country,
            language: updatedUser.language,
            gameAccounts: updatedUser.gameAccounts,
            walletAddress: updatedUser.walletAddress,
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

        const storage = await getStorage();
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await storage.getUser(decoded.userId);
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
      const storage = await getStorage();
      const pricingService = await getPricingService();
      
      const packages = await storage.getActivePackages();
      console.log('Packages retrieved from storage:', packages); // Debug log
      
      const currentPiPrice = await pricingService.getCurrentPiPrice();
      console.log('Current Pi price:', currentPiPrice); // Debug log

      const packagesWithPiPricing = packages.map((pkg: any) => ({
        ...pkg,
        piPrice: pricingService.calculatePiAmount(parseFloat(pkg.usdtValue)),
        currentPiPrice: currentPiPrice,
      }));

      console.log('Packages with Pi pricing:', packagesWithPiPricing); // Debug log
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
      const storage = await getStorage();
      const piNetworkService = await getPiNetworkService();
      const emailService = await getEmailService();
      
      switch (action) {
        case 'approve':
          // Server-Side Approval as required by Pi Network
          const paymentToApprove = await storage.getTransactionByPaymentId(data.paymentId);
          if (!paymentToApprove) {
            return res.status(404).json({ message: 'Payment not found' });
          }
          
          // Approve payment with Pi Network
          const approved = await piNetworkService.approvePayment(data.paymentId, PI_SERVER_API_KEY);
          if (!approved) {
            return res.status(500).json({ message: 'Failed to approve payment with Pi Network' });
          }
          
          // Update payment status in our database
          const approvedPayment = await storage.updateTransaction(paymentToApprove.id, { status: 'approved' });
          return res.json({ message: 'Payment approved', result: approvedPayment });

        case 'complete':
          // Server-Side Completion as required by Pi Network
          const paymentToComplete = await storage.getTransactionByPaymentId(data.paymentId);
          if (!paymentToComplete) {
            return res.status(404).json({ message: 'Payment not found' });
          }
          
          // Complete payment with Pi Network
          const completed = await piNetworkService.completePayment(data.paymentId, data.txid, PI_SERVER_API_KEY);
          if (!completed) {
            return res.status(500).json({ message: 'Failed to complete payment with Pi Network' });
          }
          
          // Update payment status in our database
          const completedPayment = await storage.updateTransaction(paymentToComplete.id, { 
            status: 'completed',
            txid: data.txid
          });
          
          // Send confirmation email if user has provided email
          try {
            const user = await storage.getUser(paymentToComplete.userId);
            const packageDetails = await storage.getPackage(paymentToComplete.packageId);
            
            // Format game account info for email
            let gameAccountInfo = '';
            if (paymentToComplete.gameAccount) {
              if (paymentToComplete.gameAccount.ign && paymentToComplete.gameAccount.uid) {
                gameAccountInfo = `IGN: ${paymentToComplete.gameAccount.ign}, UID: ${paymentToComplete.gameAccount.uid}`;
              } else if (paymentToComplete.gameAccount.userId && paymentToComplete.gameAccount.zoneId) {
                gameAccountInfo = `User ID: ${paymentToComplete.gameAccount.userId}, Zone ID: ${paymentToComplete.gameAccount.zoneId}`;
              }
            }
            
            if (user && user.email && packageDetails) {
              await emailService({
                to: user.email,
                username: user.username,
                packageName: packageDetails.name,
                piAmount: paymentToComplete.piAmount,
                usdAmount: paymentToComplete.usdAmount,
                gameAccount: gameAccountInfo,
                transactionId: data.txid,
                paymentId: data.paymentId,
                isTestnet: piNetworkService.isSandbox
              });
            }
          } catch (emailError) {
            console.error('Failed to send purchase confirmation email:', emailError);
          }
          
          return res.json({ message: 'Payment completed', result: completedPayment });

        default:
          return res.status(400).json({ message: 'Invalid action' });
      }
    } catch (error) {
      console.error('Payment operation error:', error);
      return res.status(500).json({ message: 'Payment operation failed' });
    }
  });

  // Consolidated API endpoint for transaction operations
  app.get('/api/transactions', async (req: Request, res: Response) => {
    try {
      const storage = await getStorage();
      
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userId = decoded.userId;

      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error('Transactions fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  // Pi price endpoint
  app.get('/api/pi-price', async (_req: Request, res: Response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (_req.method === "OPTIONS") return res.status(200).end();

    try {
      // Use CoinGecko API to get the current Pi price with demo key
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4"
      );

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }

      // Validate Content-Type header from CoinGecko
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`CoinGecko returned invalid content type: ${contentType}`);
      }

      // Use safer approach to parse JSON - let the fetch API handle it first
      let data;
      try {
        data = await response.json();
      } catch (parseError: any) {
        throw new Error(`Invalid JSON from CoinGecko: ${parseError.message}`);
      }

      const price = data["pi-network"]?.usd;

      if (typeof price !== "number") throw new Error("Invalid price data");

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

}
