// Mock Pi Payment endpoint for Vercel
export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  
  try {
    if (request.method === 'POST') {
      // In Vercel, the request body is already parsed as JSON
      const body = request.body || {};
      const { packageId, gameAccount } = body;
      
      // Get authorization header
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return response.status(401).json({ message: 'No token provided' });
      }
      
      const token = authHeader.replace('Bearer ', '');
      if (!token) {
        return response.status(401).json({ message: 'No token provided' });
      }
      
      // Validate input
      if (!packageId) {
        return response.status(400).json({ message: 'Package ID required' });
      }
      
      // For mock purposes, we'll use predefined packages
      const mockPackages = [
        {
          id: 'pubg-1',
          name: '60 UC',
          game: 'PUBG',
          usdtValue: '1.5000'
        },
        {
          id: 'pubg-2',
          name: '325 UC',
          game: 'PUBG',
          usdtValue: '6.5000'
        },
        {
          id: 'mlbb-1',
          name: '56 Diamonds',
          game: 'MLBB',
          usdtValue: '3.0000'
        },
        {
          id: 'mlbb-2',
          name: '278 Diamonds',
          game: 'MLBB',
          usdtValue: '6.0000'
        }
      ];
      
      const pkg = mockPackages.find(p => p.id === packageId);
      if (!pkg) {
        return response.status(404).json({ message: 'Package not found' });
      }
      
      // Mock user data
      const user = {
        id: 'mock-user-' + Date.now(),
        username: 'mock_user',
        email: 'mock@example.com',
        balance: '1000.00000000'
      };
      
      // Mock Pi price
      const currentPiPrice = 0.0001 + Math.random() * 0.001; // Random price between 0.0001 and 0.0011
      const piAmount = parseFloat(pkg.usdtValue) / currentPiPrice;
      
      // Check if user has sufficient balance
      const userBalance = parseFloat(user.balance || '1000.00000000');
      if (userBalance < piAmount) {
        return response.status(400).json({ message: 'Insufficient balance' });
      }
      
      // Mock deduct balance from user (in a real implementation, this would update the database)
      const newBalance = userBalance - piAmount;
      
      // Create mock transaction record
      const mockPaymentId = 'MOCK-' + Date.now();
      const mockTxId = 'MOCK-TX-' + Date.now();
      
      const transaction = {
        id: 'transaction-' + Date.now(),
        userId: user.id,
        packageId: packageId,
        paymentId: mockPaymentId,
        txid: mockTxId,
        piAmount: piAmount.toString(),
        usdAmount: pkg.usdtValue,
        piPriceAtTime: currentPiPrice.toString(),
        status: 'completed',
        gameAccount: gameAccount || {},
        metadata: {
          type: 'mock-payment',
          mock: true
        },
        emailSent: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // For mock purposes, we'll also update our mock transactions
      if (!global.mockTransactions) {
        global.mockTransactions = [];
      }
      global.mockTransactions.push(transaction);
      
      response.status(200).json({
        success: true,
        message: "Mock payment processed successfully",
        transactionId: transaction.id,
        newBalance: newBalance
      });
    } else {
      response.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Mock payment error:', error);
    response.status(500).json({ message: 'Mock payment failed', error: error.message });
  }
}