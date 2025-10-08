import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { insertUserSchema, insertPackageSchema } from "@shared/schema";
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
  // Middleware for admin authentication
  const authenticateAdmin = async (req: Request, res: Response, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const storage = await getStorage();
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const admin = await storage.getAdminByUsername(decoded.username);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: 'Invalid admin token' });
      }
      req.admin = admin;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };

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

        case 'login':
          const { username, password } = data;
          if (!username || !password) {
            return res.status(400).json({ message: 'Username and password required' });
          }

          const admin = await storage.getAdminByUsername(username);
          if (!admin || !admin.isActive) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }

          const isValidPassword = await bcrypt.compare(password, admin.password);
          if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
          }

          await storage.updateAdminLastLogin(admin.id);

          const adminToken = jwt.sign({ adminId: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });

          return res.json({
            admin: {
              id: admin.id,
              username: admin.username,
              email: admin.email,
              role: admin.role,
            },
            token: adminToken,
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

  // Get current Pi price
  app.get('/api/pi-price', async (req: Request, res: Response) => {
    try {
      const pricingService = await getPricingService();
      
      const price = await pricingService.getCurrentPiPrice();
      const lastPrice = pricingService.getLastPrice();
      
      res.json({
        price,
        lastUpdated: lastPrice?.lastUpdated || new Date(),
      });
    } catch (error) {
      console.error('Pi price fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch Pi price' });
    }
  });

  // Consolidated API endpoint for payment operations
  app.post('/api/payments', async (req: Request, res: Response) => {
    const { action, data } = req.body;
    
    try {
      const storage = await getStorage();
      const pricingService = await getPricingService();
      const piNetworkService = await getPiNetworkService();
      const sendPurchaseConfirmationEmail = await getEmailService();
      
      // Get API key from environment
      const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY || 'mock_pi_server_api_key_for_development';

      switch (action) {
        case 'approve':
          const { paymentId } = data;
          if (!paymentId) {
            return res.status(400).json({ message: 'Payment ID required' });
          }

          // Get payment details from Pi Network Testnet
          const payment = await piNetworkService.getPayment(paymentId, PI_SERVER_API_KEY);
          if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
          }

          // Validate payment metadata
          if (!payment.metadata?.type || payment.metadata.type !== 'backend') {
            return res.status(400).json({ message: 'Invalid payment metadata' });
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
            return res.status(500).json({ message: 'Payment approval failed' });
          }

          // Update transaction status
          await storage.updateTransaction(transaction.id, { status: 'approved' });

          return res.json({ success: true, transactionId: transaction.id });

        case 'complete':
          const { paymentId: completePaymentId, txid } = data;
          if (!completePaymentId || !txid) {
            return res.status(400).json({ message: 'Payment ID and txid required' });
          }

          const completeTransaction = await storage.getTransactionByPaymentId(completePaymentId);
          if (!completeTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
          }

          // Complete payment with Pi Network Testnet
          const completed = await piNetworkService.completePayment(completePaymentId, txid, PI_SERVER_API_KEY);
          if (!completed) {
            await storage.updateTransaction(completeTransaction.id, { status: 'failed' });
            return res.status(500).json({ message: 'Payment completion failed' });
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

          return res.json({ success: true, transactionId: completeTransaction.id, txid });

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

  // Admin routes
  app.post('/api/admin', authenticateAdmin, async (req: Request, res: Response) => {
    const { action, data } = req.body;
    
    try {
      const storage = await getStorage();
      
      switch (action) {
        case 'analytics':
          const analytics = await storage.getAnalytics();
          return res.json(analytics);

        case 'transactions':
          const transactions = await storage.getAllTransactions();
          return res.json(transactions);

        case 'packages':
          const packages = await storage.getPackages();
          return res.json(packages);

        case 'createPackage':
          // Note: You might need to import zod validation here
          const newPackage = await storage.createPackage(data);
          return res.json(newPackage);

        case 'updatePackage':
          const { id, updateData } = data;
          const updatedPackage = await storage.updatePackage(id, updateData);
          
          if (!updatedPackage) {
            return res.status(404).json({ message: 'Package not found' });
          }
          
          return res.json(updatedPackage);

        default:
          return res.status(400).json({ message: 'Invalid action' });
      }
    } catch (error) {
      console.error('Admin operation error:', error);
      return res.status(500).json({ message: 'Admin operation failed' });
    }
  });
}