import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { piNetworkService } from "./services/pi-network";
import { pricingService } from "./services/pricing";
import { sendPurchaseConfirmationEmail } from "./services/email";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { insertUserSchema, insertPackageSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret';

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware for admin authentication
  const authenticateAdmin = async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
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

  // Pi Network Authentication
  app.post('/api/auth/pi', async (req, res) => {
    try {
      const { accessToken } = req.body;
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
      } else {
        // If user exists but doesn't have a wallet address, we'll try to update it
        // This will happen when they make their first transaction
      }

      // Generate JWT token for session
      const token = jwt.sign({ userId: user.id, piUID: user.piUID }, JWT_SECRET, { expiresIn: '7d' });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          country: user.country,
          language: user.language,
          gameAccounts: user.gameAccounts,
          walletAddress: user.walletAddress,
          profileImageUrl: user.profileImageUrl,
        },
        token,
      });
    } catch (error) {
      console.error('Pi authentication error:', error);
      res.status(500).json({ message: 'Authentication failed' });
    }
  });

  // Admin Authentication
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
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

      const token = jwt.sign({ adminId: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });

      res.json({
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        },
        token,
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Get current Pi price
  app.get('/api/pi-price', async (req, res) => {
    try {
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

  // Get packages with Pi pricing
  app.get('/api/packages', async (req, res) => {
    try {
      const packages = await storage.getActivePackages();
      const currentPiPrice = await pricingService.getCurrentPiPrice();

      const packagesWithPiPricing = packages.map(pkg => ({
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

  // User profile update
  app.put('/api/profile', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userId = decoded.userId;

      // Handle both JSON and multipart form data
      let updateData: any = {};
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        // For multipart form data (file uploads)
        updateData = {};
        // Process text fields
        Object.keys(req.body).forEach(key => {
          try {
            updateData[key] = JSON.parse(req.body[key]);
          } catch (e) {
            // If parsing fails, use as string
            updateData[key] = req.body[key];
          }
        });
        
        // Handle profile image upload (placeholder - in a real app you'd save to storage)
        if ((req as any).files && (req as any).files.length > 0) {
          const file = (req as any).files[0];
          // In a real implementation, you would upload to cloud storage and save the URL
          // For now, we'll just generate a placeholder URL
          updateData.profileImageUrl = `/uploads/profile-${userId}-${Date.now()}.jpg`;
        }
      } else {
        // For JSON data
        updateData = req.body;
      }
      
      // Validate required fields
      if (updateData.email && !updateData.email.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Email must be a Gmail address' });
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      // Return a proper JSON error response
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message || 'Profile update failed' });
      }
      return res.status(500).json({ message: 'Profile update failed' });
    }
  });

  // Payment approval endpoint
  app.post('/api/payment/approve', async (req, res) => {
    try {
      const { paymentId } = req.body;
      if (!paymentId) {
        return res.status(400).json({ message: 'Payment ID required' });
      }

      // Get payment details from Pi Network
      const payment = await piNetworkService.getPayment(paymentId);
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

      // Approve payment with Pi Network
      const approved = await piNetworkService.approvePayment(paymentId);
      if (!approved) {
        await storage.updateTransaction(transaction.id, { status: 'failed' });
        return res.status(500).json({ message: 'Payment approval failed' });
      }

      // Update transaction status
      await storage.updateTransaction(transaction.id, { status: 'approved' });

      res.json({ success: true, transactionId: transaction.id });
    } catch (error) {
      console.error('Payment approval error:', error);
      res.status(500).json({ message: 'Payment approval failed' });
    }
  });

  // Payment completion endpoint
  app.post('/api/payment/complete', async (req, res) => {
    try {
      const { paymentId, txid } = req.body;
      if (!paymentId || !txid) {
        return res.status(400).json({ message: 'Payment ID and txid required' });
      }

      const transaction = await storage.getTransactionByPaymentId(paymentId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      // Complete payment with Pi Network
      const completed = await piNetworkService.completePayment(paymentId, txid);
      if (!completed) {
        await storage.updateTransaction(transaction.id, { status: 'failed' });
        return res.status(500).json({ message: 'Payment completion failed' });
      }

      // Update transaction with txid and completed status
      await storage.updateTransaction(transaction.id, { 
        status: 'completed', 
        txid: txid,
      });

      // Send confirmation email
      try {
        const user = await storage.getUser(transaction.userId);
        const pkg = await storage.getPackage(transaction.packageId);
        
        if (user && pkg && user.email) {
          const gameAccountString = transaction.gameAccount.ign 
            ? `${transaction.gameAccount.ign} (${transaction.gameAccount.uid})`
            : `${transaction.gameAccount.userId}:${transaction.gameAccount.zoneId}`;

          const emailSent = await sendPurchaseConfirmationEmail({
            to: user.email,
            username: user.username,
            packageName: pkg.name,
            piAmount: transaction.piAmount,
            usdAmount: transaction.usdAmount,
            gameAccount: gameAccountString,
            transactionId: transaction.id,
            paymentId: paymentId,
            isTestnet: process.env.NODE_ENV !== 'production',
          });

          await storage.updateTransaction(transaction.id, { emailSent });
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the transaction if email fails
      }

      res.json({ success: true, transactionId: transaction.id, txid });
    } catch (error) {
      console.error('Payment completion error:', error);
      res.status(500).json({ message: 'Payment completion failed' });
    }
  });

  // Get user transactions
  app.get('/api/transactions', async (req, res) => {
    try {
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

  // Admin endpoints
  app.get('/api/admin/analytics', authenticateAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  app.get('/api/admin/transactions', authenticateAdmin, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error('Admin transactions fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
  });

  app.get('/api/admin/packages', authenticateAdmin, async (req, res) => {
    try {
      const packages = await storage.getPackages();
      res.json(packages);
    } catch (error) {
      console.error('Admin packages fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch packages' });
    }
  });

  app.post('/api/admin/packages', authenticateAdmin, async (req, res) => {
    try {
      const packageData = insertPackageSchema.parse(req.body);
      const newPackage = await storage.createPackage(packageData);
      res.json(newPackage);
    } catch (error) {
      console.error('Package creation error:', error);
      res.status(500).json({ message: 'Failed to create package' });
    }
  });

  app.put('/api/admin/packages/:id', authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedPackage = await storage.updatePackage(id, updateData);
      
      if (!updatedPackage) {
        return res.status(404).json({ message: 'Package not found' });
      }
      
      res.json(updatedPackage);
    } catch (error) {
      console.error('Package update error:', error);
      res.status(500).json({ message: 'Failed to update package' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
