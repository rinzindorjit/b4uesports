// Simple preview server that serves the client without requiring a database
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Add middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the client build directory
const staticPath = path.join(__dirname, 'dist');
console.log('Static files path:', staticPath);
console.log('Index file path:', path.join(staticPath, 'index.html'));

app.use(express.static(staticPath));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File path for storing preview data
const PREVIEW_DATA_FILE = path.join(__dirname, 'preview-data.json');

// Function to load preview data from file
function loadPreviewData() {
  try {
    if (fs.existsSync(PREVIEW_DATA_FILE)) {
      const data = fs.readFileSync(PREVIEW_DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading preview data:', error);
  }
  return {};
}

// Function to save preview data to file
function savePreviewData(data) {
  try {
    fs.writeFileSync(PREVIEW_DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving preview data:', error);
  }
}

// Load preview data at startup
let previewData = loadPreviewData();

// API endpoints that return mock data for preview
app.get('/api/metadata', (req, res) => {
  const metadata = {
    // Application metadata
    application: {
      name: "B4U Esports",
      description: "Pi Network Integrated Marketplace for Gaming Currency",
      version: "1.0.0",
      platform: "Pi Network",
      category: "Gaming"
    },
    
    // Payment metadata
    payment: {
      currency: "Pi",
      supported_operations: [
        "buy_gaming_currency",
        "deposit",
        "withdrawal"
      ],
      min_amount: 0.1,
      max_amount: 10000,
      fee_structure: {
        deposit_fee: 0,
        withdrawal_fee: 0,
        transaction_fee: 0
      }
    },
    
    // Security metadata
    security: {
      encryption: "AES-256",
      authentication: "Pi Network OAuth",
      data_protection: "GDPR Compliant",
      ssl_required: true
    },
    
    // API endpoints
    endpoints: {
      authentication: "/api/auth/pi",
      payment_create: "/api/payment/create",
      payment_approve: "/api/payment/approve",
      payment_complete: "/api/payment/complete",
      user_profile: "/api/profile",
      packages: "/api/packages",
      transactions: "/api/transactions"
    },
    
    // Supported games
    supported_games: [
      {
        id: "pubg",
        name: "PUBG Mobile",
        currency: "UC (Unknown Cash)",
        description: "Popular battle royale game"
      },
      {
        id: "mlbb",
        name: "Mobile Legends: Bang Bang",
        currency: "Diamonds",
        description: "MOBA game developed by Moonton"
      }
    ],
    
    // Contact information
    contact: {
      support_email: "info@b4uesports.com",
      website: "https://b4uesports.com",
      phone: "+975 17875099"
    },
    
    // Legal information
    legal: {
      terms_of_service: "/terms-of-service",
      privacy_policy: "/privacy-policy",
      refund_policy: "/refund-policy"
    },
    
    // Timestamp
    last_updated: new Date().toISOString()
  };
  
  res.json(metadata);
});

app.get('/api/packages', async (req, res) => {
  // Get the current Pi price from CoinGecko
  let currentPiPrice = 0.01; // Default fallback price
  
  try {
    // Fetch live Pi price from CoinGecko with a shorter timeout
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4', {
      timeout: 3000 // 3 second timeout
    });
    const data = await response.json();
    currentPiPrice = data['pi-network']?.usd || 0.01;
  } catch (error) {
    console.error('Failed to fetch Pi price from CoinGecko for packages:', error);
  }
  
  const mockPackages = [
    // PUBG Packages with correct Pi pricing based on USDT values
    { id: 'pubg-1', game: 'PUBG', name: '60 UC', inGameAmount: 60, usdtValue: '1.5000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 1.5 / currentPiPrice },
    { id: 'pubg-2', game: 'PUBG', name: '325 UC', inGameAmount: 325, usdtValue: '6.5000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 6.5 / currentPiPrice },
    { id: 'pubg-3', game: 'PUBG', name: '660 UC', inGameAmount: 660, usdtValue: '12.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 12.0 / currentPiPrice },
    { id: 'pubg-4', game: 'PUBG', name: '1800 UC', inGameAmount: 1800, usdtValue: '25.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 25.0 / currentPiPrice },
    { id: 'pubg-5', game: 'PUBG', name: '3850 UC', inGameAmount: 3850, usdtValue: '49.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 49.0 / currentPiPrice },
    { id: 'pubg-6', game: 'PUBG', name: '8100 UC', inGameAmount: 8100, usdtValue: '96.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 96.0 / currentPiPrice },
    { id: 'pubg-7', game: 'PUBG', name: '16200 UC', inGameAmount: 16200, usdtValue: '186.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 186.0 / currentPiPrice },
    { id: 'pubg-8', game: 'PUBG', name: '24300 UC', inGameAmount: 24300, usdtValue: '278.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 278.0 / currentPiPrice },
    { id: 'pubg-9', game: 'PUBG', name: '32400 UC', inGameAmount: 32400, usdtValue: '369.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 369.0 / currentPiPrice },
    { id: 'pubg-10', game: 'PUBG', name: '40500 UC', inGameAmount: 40500, usdtValue: '459.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 459.0 / currentPiPrice },
    
    // MLBB Packages with correct Pi pricing based on USDT values
    { id: 'mlbb-1', game: 'MLBB', name: '56 Diamonds', inGameAmount: 56, usdtValue: '3.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 3.0 / currentPiPrice },
    { id: 'mlbb-2', game: 'MLBB', name: '278 Diamonds', inGameAmount: 278, usdtValue: '6.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 6.0 / currentPiPrice },
    { id: 'mlbb-3', game: 'MLBB', name: '571 Diamonds', inGameAmount: 571, usdtValue: '11.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 11.0 / currentPiPrice },
    { id: 'mlbb-4', game: 'MLBB', name: '1783 Diamonds', inGameAmount: 1783, usdtValue: '33.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 33.0 / currentPiPrice },
    { id: 'mlbb-5', game: 'MLBB', name: '3005 Diamonds', inGameAmount: 3005, usdtValue: '52.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 52.0 / currentPiPrice },
    { id: 'mlbb-6', game: 'MLBB', name: '6012 Diamonds', inGameAmount: 6012, usdtValue: '99.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 99.0 / currentPiPrice },
    { id: 'mlbb-7', game: 'MLBB', name: '12000 Diamonds', inGameAmount: 12000, usdtValue: '200.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 200.0 / currentPiPrice }
  ];
  
  res.json(mockPackages);
});

// Add endpoint to get user transactions in preview mode
app.get('/api/transactions', (req, res) => {
  // Initialize mock transactions array if it doesn't exist
  if (!previewData.mockTransactions) {
    previewData.mockTransactions = [
      {
        id: '1',
        userId: 'preview-user-123',
        packageId: 'pubg-1',
        paymentId: 'payment-1',
        piAmount: '150.0',
        usdAmount: '1.5',
        piPriceAtTime: '0.01',
        status: 'completed',
        gameAccount: { ign: 'PreviewPlayer', uid: '123456789' },
        emailSent: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        userId: 'preview-user-123',
        packageId: 'mlbb-1',
        paymentId: 'payment-2',
        piAmount: '300.0',
        usdAmount: '3.0',
        piPriceAtTime: '0.01',
        status: 'completed',
        gameAccount: { userId: '987654321', zoneId: '1234' },
        emailSent: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    savePreviewData(previewData);
  }
  
  // Filter transactions for the current user
  const userTransactions = previewData.mockTransactions.filter(tx => tx.userId === 'preview-user-123');
  res.json(userTransactions);
});

// Add endpoint to create new transactions in preview mode
app.post('/api/transactions', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Create a new transaction
    const newTransaction = {
      id: 'transaction-' + Date.now(),
      userId: 'preview-user-123',
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Initialize mock transactions array if it doesn't exist
    if (!previewData.mockTransactions) {
      previewData.mockTransactions = [];
    }
    
    // Add the new transaction
    previewData.mockTransactions.push(newTransaction);
    savePreviewData(previewData);
    
    res.json(newTransaction);
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ message: 'Transaction creation failed' });
  }
});

// Development login endpoint for testing
app.post('/api/auth/pi', (req, res) => {
  // Mock user for development/testing
  // Check if we have a saved user profile
  let mockUser = previewData.previewUserData;
  
  if (!mockUser) {
    mockUser = {
      id: 'preview-user-123',
      piUID: 'preview-pi-uid-123',
      username: 'preview_user',
      email: 'preview@example.com',
      phone: '+1234567890',
      country: 'US',
      language: 'en',
      walletAddress: 'GAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      gameAccounts: {
        pubg: { ign: 'PreviewPlayer', uid: '123456789' },
        mlbb: { userId: '987654321', zoneId: '1234' }
      },
      profileImageUrl: null,
      isProfileVerified: false, // Initialize as false, will be set to true when profile is completed
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Mock JWT token
  const mockToken = 'preview-jwt-token-12345';

  res.json({
    user: mockUser,
    token: mockToken
  });
});

// Add endpoint for profile update in preview mode
app.put('/api/profile', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // In preview mode, just return the updated user data
    const updateData = req.body;
    
    // For preview mode, we'll use persistent storage
    if (!previewData.previewUserData) {
      previewData.previewUserData = {
        id: 'preview-user-123',
        piUID: 'preview-pi-uid-123',
        username: 'preview_user',
        email: 'preview@example.com',
        phone: '+1234567890',
        country: 'US',
        language: 'en',
        walletAddress: 'GAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        gameAccounts: {
          pubg: { ign: 'PreviewPlayer', uid: '123456789' },
          mlbb: { userId: '987654321', zoneId: '1234' }
        },
        profileImageUrl: null,
        isProfileVerified: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    // Check if profile is being completed (email and phone provided)
    // If so, mark as verified
    if (updateData.email && updateData.phone) {
      updateData.isProfileVerified = true;
    }
    
    // Ensure isProfileVerified status is maintained if already verified
    if (previewData.previewUserData && previewData.previewUserData.isProfileVerified) {
      updateData.isProfileVerified = true;
    }
    
    // Update user data with new values
    previewData.previewUserData = {
      ...previewData.previewUserData,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Save to persistent storage
    savePreviewData(previewData);
    
    res.json(previewData.previewUserData);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Profile update failed' });
  }
});

// Mock Pi balance endpoint for development
app.get('/api/pi-balance', (req, res) => {
  // Mock balance for testing - fixed at 1000 Pi
  const mockBalance = {
    balance: 1000, // Fixed balance at 1000 Pi
    currency: 'π',
    lastUpdated: new Date().toISOString(),
    isTestnet: true
  };

  res.json(mockBalance);
});

// Mock Pi price endpoint for development
app.get('/api/pi-price', async (req, res) => {
  try {
    // Fetch live Pi price from CoinGecko with a shorter timeout
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4', {
      timeout: 3000 // 3 second timeout
    });
    const data = await response.json();
    
    const price = data['pi-network']?.usd || 0.01; // fallback to 0.01 if not available
    
    res.json({
      price,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch Pi price from CoinGecko:', error);
    // Fallback to default price
    res.json({
      price: 0.01,
      lastUpdated: new Date().toISOString(),
    });
  }
});

// All other routes serve the client app
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist/index.html');
  console.log('Serving index.html from:', indexPath);
  
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error serving index.html');
    }
  });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Preview server running on http://localhost:${PORT}`);
  console.log('Note: This is a preview mode without database connectivity.');
  console.log('Some features like profile updates and real payments are simulated.');
  console.log('Static files path:', path.join(__dirname, 'dist'));
  console.log('Index file path:', path.join(__dirname, 'dist/index.html'));
});