import type { VercelRequest, VercelResponse } from '@vercel/node';
import { JWT_SECRET, getStorage, getPiNetworkService, jwt, bcrypt } from './_utils';

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
    // Get services dynamically
    const storage = await getStorage();
    const piNetworkService = await getPiNetworkService();

    // Handle GET /me endpoint for token validation
    if (request.method === 'GET' && request.url?.endsWith('/me')) {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return response.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user = await storage.getUser(decoded.userId);
        
        if (!user) {
          return response.status(401).json({ message: 'Invalid token' });
        }

        return response.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          country: user.country,
          language: user.language,
          gameAccounts: user.gameAccounts,
          walletAddress: user.walletAddress,
        });
      } catch (error) {
        return response.status(401).json({ message: 'Invalid token' });
      }
    }

    const { action, data } = request.body;
    
    switch (action) {
      case 'authenticate':
        console.log('Authentication request received for Pi Network Testnet');
        const { accessToken } = data;
        if (!accessToken) {
          console.log('No access token provided');
          return response.status(400).json({ message: 'Access token required' });
        }

        console.log('Verifying access token with Pi Network Testnet API');
        // Verify the user's identity by requesting the /me endpoint from your backend
        // using the access token obtained with the Pi.authenticate method
        const piUser = await piNetworkService.verifyAccessToken(accessToken);
        if (!piUser) {
          console.log('Invalid Pi Network token');
          return response.status(401).json({ message: 'Invalid Pi Network token' });
        }

        console.log('Pi Network user verified:', piUser);
        // Check if user exists, if not create new user
        let user = await storage.getUserByPiUID(piUser.uid);
        if (!user) {
          console.log('Creating new user for Pi UID:', piUser.uid);
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
          console.log('Existing user found for Pi UID:', piUser.uid);
        }

        // Generate JWT token for session as required by Pi Network guidelines
        const userToken = jwt.sign({ userId: user.id, piUID: user.piUID }, JWT_SECRET, { expiresIn: '7d' });
        console.log('Generated JWT token for user:', user.id);

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