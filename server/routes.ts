import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { insertUserSchema, insertPackageSchema } from "@shared/schema";
import { z } from "zod";
// Import the pi-price route
import piPriceRoute from "./routes/pi-price";

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
  // Register the pi-price route
  app.use("/api", piPriceRoute);
  
  // Consolidated API endpoint for user operations
  app.post('/api/users', async (req: Request, res: Response) => {
    const { action, data } = req.body;
    
    try {
      const storage = await getStorage();
      const piNetworkService = await getPiNetworkService();
      
      switch (action) {
        case 'authenticate':
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
          const profileToken = req.headers.authorization?.replace('Bearer ', '');
          if (!profileToken) {
            return res.status(401).json({ message: 'No token provided' });
          }

          const decoded = jwt.verify(profileToken, JWT_SECRET) as any;
          const userId = decoded.userId;

          const updateData = data;
          
          // Validate required fields
          if (!updateData.email || !updateData.phone || !updateData.country) {
            return res.status(400).json({ message: 'Email, phone, and country are required' });
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(updateData.email)) {
            return res.status(400).json({ message: 'Invalid email format' });
          }

          // Validate phone format (allow only numbers and common separators)
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(updateData.phone)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
          }

          // Validate game accounts if provided
          if (updateData.gameAccounts) {
            if (updateData.gameAccounts.pubg) {
              if (!updateData.gameAccounts.pubg.ign || !updateData.gameAccounts.pubg.uid) {
                return res.status(400).json({ message: 'PUBG IGN and UID are required' });
              }
              // Validate UID is numeric
              if (!/^\d+$/.test(updateData.gameAccounts.pubg.uid)) {
                return res.status(400).json({ message: 'PUBG UID must be numeric' });
              }
            }
            
            if (updateData.gameAccounts.mlbb) {
              if (!updateData.gameAccounts.mlbb.userId || !updateData.gameAccounts.mlbb.zoneId) {
                return res.status(400).json({ message: 'MLBB User ID and Zone ID are required' });
              }
              // Validate IDs are numeric
              if (!/^\d+$/.test(updateData.gameAccounts.mlbb.userId) || !/^\d+$/.test(updateData.gameAccounts.mlbb.zoneId)) {
                return res.status(400).json({ message: 'MLBB User ID and Zone ID must be numeric' });
              }
            }
          }

          const updatedUser = await storage.updateUser(userId, updateData);
          if (!updatedUser) {
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
    try {
      const storage = await getStorage();
      const pricingService = await getPricingService();
      
      const packages = await storage.getActivePackages();
      const currentPiPrice = await pricingService.getCurrentPiPrice();

      const packagesWithPiPricing = packages.map((pkg: any) => ({
        ...pkg,
        piPrice: pricingService.calculatePiAmount(parseFloat(pkg.usdtValue)),
        currentPiPrice,
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
    
    try {
      const storage = await getStorage();
      const piNetworkService = await getPiNetworkService();
      
      switch (action) {
        case 'approve':
          // Server-Side Approval as required by Pi Network
          const payment = await storage.getTransactionByPaymentId(data.paymentId);
          if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
          }
          
          // In a real implementation, you would call the Pi Network API to approve the payment
          // For now, we'll just update the status in our database
          const updatedPayment = await storage.updateTransaction(payment.id, { status: 'approved' });
          return res.json({ message: 'Payment approved', result: updatedPayment });

        case 'complete':
          // Server-Side Completion as required by Pi Network
          const paymentToComplete = await storage.getTransactionByPaymentId(data.paymentId);
          if (!paymentToComplete) {
            return res.status(404).json({ message: 'Payment not found' });
          }
          
          // In a real implementation, you would call the Pi Network API to complete the payment
          // For now, we'll just update the status in our database
          const completedPayment = await storage.updateTransaction(paymentToComplete.id, { 
            status: 'completed',
            txid: data.txid
          });
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
  app.get('/api/pi-price', async (req: Request, res: Response) => {
    try {
      const pricingService = await getPricingService();
      const currentPiPrice = await pricingService.getCurrentPiPrice();
      
      res.json({
        pi: currentPiPrice,
        currency: 'USD',
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Pi price fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch Pi price' });
    }
  });
}