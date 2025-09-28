import type { VercelRequest, VercelResponse } from '@vercel/node';
import '../server/storage';
import '../server/services/pi-network';
import '../server/services/pricing';
import '../server/services/email';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Since we're in a serverless environment, we need to import the actual implementations
// Let me create a simpler approach by using the existing server modules

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    // Import modules dynamically to avoid issues with serverless environment
    const { storage } = await import('../server/storage');
    const { piNetworkService } = await import('../server/services/pi-network');
    const { JWT_SECRET } = await import('./_utils');

    const { action, data } = request.body;
    
    switch (action) {
      case 'authenticate':
        const { accessToken } = data;
        if (!accessToken) {
          return response.status(400).json({ message: 'Access token required' });
        }

        const piUser = await piNetworkService.verifyAccessToken(accessToken);
        if (!piUser) {
          return response.status(401).json({ message: 'Invalid Pi Network token' });
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

        return response.status(200).json({
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

        const admin = await storage.getAdminByUsername(username);
        if (!admin || !admin.isActive) {
          return response.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
          return response.status(401).json({ message: 'Invalid credentials' });
        }

        // Import storage again for the updateAdminLastLogin function
        await storage.updateAdminLastLogin(admin.id);

        const adminToken = jwt.sign({ adminId: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });

        return response.status(200).json({
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

        const updatedUser = await storage.updateUser(userId, updateData);
        if (!updatedUser) {
          return response.status(404).json({ message: 'User not found' });
        }

        return response.status(200).json(updatedUser);

      default:
        return response.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('User operation error:', error);
    return response.status(500).json({ message: 'Operation failed' });
  }
}