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
      // Check if this is a mock request (for Pi Browser development)
      if (req.body.isMockAuth) {
        console.log('Using mock authentication for Pi Browser development');
        
        // Create mock user data
        const mockUser = {
          id: 'mock-user-' + Date.now(),
          piUID: 'mock-pi-uid-' + Date.now(),
          username: 'pi_user_' + Math.floor(Math.random() * 10000),
          email: 'piuser@example.com',
          phone: '+1234567890',
          country: 'US',
          language: 'en',
          walletAddress: 'GAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          gameAccounts: {
            pubg: { ign: 'PiPlayer', uid: 'PID123456789' },
            mlbb: { userId: 'MLBB987654321', zoneId: 'ZONE1234' }
          },
          profileImageUrl: null,
          isProfileVerified: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Generate a mock JWT token
        const mockToken = 'mock-jwt-token-' + Date.now();

        console.log('Mock authentication successful for user:', mockUser.username);
        
        // Add a small delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return res.status(200).json({
          user: mockUser,
          token: mockToken
        });
      }
      
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
          isProfileVerified: false, // Profile not verified yet
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
      
      console.log('API /api/pi-price returning:', { price, lastPrice });
      
      res.json({
        price,
        lastUpdated: lastPrice?.lastUpdated || new Date(),
      });
    } catch (error) {
      console.error('Pi price fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch Pi price' });
    }
  });

  // Get user Pi balance (for testing only)
  app.get('/api/pi-balance', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userId = decoded.userId;

      // Get user from database to get their actual balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const balance = {
        balance: parseFloat(user.balance || '1000.00000000'), // Default to 1000 Pi if no balance set
        currency: 'π',
        lastUpdated: new Date().toISOString(),
        isTestnet: true
      };

      res.json(balance);
    } catch (error) {
      console.error('Pi balance fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch Pi balance' });
    }
  });

  // Mock Pi Payment Endpoint
  app.post('/api/mock-pi-payment', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const userId = decoded.userId;

      const { packageId, gameAccount } = req.body;

      // Validate input
      if (!packageId) {
        return res.status(400).json({ message: 'Package ID required' });
      }

      // Get user and package
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const pkg = await storage.getPackage(packageId);
      if (!pkg) {
        return res.status(404).json({ message: 'Package not found' });
      }

      // Check if user has sufficient balance
      const userBalance = parseFloat(user.balance || '1000.00000000');
      const packagePrice = parseFloat(pkg.usdtValue);
      const currentPiPrice = await pricingService.getCurrentPiPrice();
      const piAmount = pricingService.calculatePiAmount(packagePrice);
      
      if (userBalance < piAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Deduct balance from user
      const updatedUser = await storage.updateUserBalance(userId, piAmount, 'subtract');
      if (!updatedUser) {
        return res.status(500).json({ message: 'Failed to update user balance' });
      }

      // Create transaction record
      const mockPaymentId = 'MOCK-' + Date.now();
      const mockTxId = 'MOCK-TX-' + Date.now();
      
      const transactionData: any = {
        userId: userId,
        packageId: packageId,
        paymentId: mockPaymentId,
        txid: mockTxId,
        piAmount: piAmount.toString(),
        usdAmount: packagePrice.toString(),
        piPriceAtTime: currentPiPrice.toString(),
        status: 'completed',
        gameAccount: gameAccount || {},
        metadata: {
          type: 'mock-payment',
          mock: true
        },
        emailSent: false
      };

      const transaction = await storage.createTransaction(transactionData);

      // Send confirmation email
      try {
        if (user.email) {
          const gameAccountString = gameAccount?.ign 
            ? `${gameAccount.ign} (${gameAccount.uid})`
            : `${gameAccount?.userId}:${gameAccount?.zoneId}`;

          const emailSent = await sendPurchaseConfirmationEmail({
            to: user.email,
            username: user.username,
            packageName: pkg.name,
            piAmount: piAmount.toString(),
            usdAmount: packagePrice.toString(),
            gameAccount: gameAccountString,
            transactionId: transaction.id,
            paymentId: mockPaymentId,
            isTestnet: true,
          });

          await storage.updateTransaction(transaction.id, { emailSent });
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the transaction if email fails
      }

      res.json({
        success: true,
        message: "Mock payment processed successfully",
        transactionId: transaction.id,
        newBalance: parseFloat(updatedUser.balance || '0')
      });
    } catch (error) {
      console.error('Mock payment error:', error);
      res.status(500).json({ message: 'Mock payment failed', error: error instanceof Error ? error.message : 'Unknown error' });
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

      // Verify JWT token
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
            // Try to parse as JSON first (for objects like gameAccounts)
            updateData[key] = JSON.parse(req.body[key]);
          } catch (e) {
            // If parsing fails, use as string (for primitive values)
            updateData[key] = req.body[key];
          }
        });
        
        // Handle profile image upload
        if ((req as any).files && (req as any).files.length > 0) {
          const file = (req as any).files[0];
          // In a real implementation, you would upload to cloud storage and save the URL
          // For now, we'll just generate a placeholder URL
          updateData.profileImageUrl = `/uploads/profile-${userId}-${Date.now()}.${file.originalname.split('.').pop()}`;
          
          // Move the file to the uploads directory with the new name
          const fs = require('fs');
          const path = require('path');
          const uploadPath = path.join(__dirname, '../uploads', `profile-${userId}-${Date.now()}.${file.originalname.split('.').pop()}`);
          
          // Ensure uploads directory exists
          const uploadsDir = path.join(__dirname, '../uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          // Move file from temp location to final location
          // Check if file.path exists before moving
          if (fs.existsSync(file.path)) {
            fs.renameSync(file.path, uploadPath);
          } else {
            // If file.path doesn't exist, create a placeholder
            fs.writeFileSync(uploadPath, '');
          }
        }
      } else {
        // For JSON data
        updateData = req.body;
      }
      
      // Validate required fields
      if (updateData.email && !updateData.email.endsWith('@gmail.com')) {
        return res.status(400).json({ message: 'Email must be a Gmail address' });
      }

      // If profile is being completed (email and phone provided), set as verified
      // But don't override if it's already verified
      if (updateData.email && updateData.phone && updateData.isProfileVerified !== false) {
        updateData.isProfileVerified = true;
      }

      // Try to update user in database
      let updatedUser;
      try {
        updatedUser = await storage.updateUser(userId, updateData);
      } catch (dbError) {
        console.error('Database error during profile update:', dbError);
        // Return mock success response for preview mode
        return res.json({
          id: userId,
          ...updateData,
          updatedAt: new Date().toISOString()
        });
      }
      
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
      return res.status(500).json({ message: 'Profile update failed: ' + (error as any).message });
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

      // Get payment details to extract wallet address and amount
      const paymentDetails = await piNetworkService.getPayment(paymentId);
      let walletAddress = '';
      let paymentAmount = 0;
      if (paymentDetails) {
        if (paymentDetails.from_address) {
          walletAddress = paymentDetails.from_address;
        }
        if (paymentDetails.amount) {
          paymentAmount = paymentDetails.amount;
        }
      }

      // Update user's wallet address if it's not already set
      if (walletAddress) {
        const user = await storage.getUser(transaction.userId);
        if (user && !user.walletAddress) {
          await storage.updateUser(transaction.userId, { walletAddress });
        }
      }

      // Update transaction with txid and completed status
      await storage.updateTransaction(transaction.id, { 
        status: 'completed', 
        txid: txid,
      });

      // In a real implementation, the Pi Network would handle balance deduction
      // For our purposes, we'll just log the transaction

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