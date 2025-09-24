// Pi Network authentication endpoint for Vercel
import { piNetworkService } from '../../server/services/pi-network';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { accessToken } = request.body;
    if (!accessToken) {
      return response.status(400).json({ message: 'Access token required' });
    }

    const piUser = await piNetworkService.verifyAccessToken(accessToken);
    if (!piUser) {
      return response.status(401).json({ message: 'Invalid Pi Network token' });
    }

    // For mock purposes, we'll return a mock user
    // In a real implementation, you would create/update the user in your database
    const mockUser = {
      id: 'user-' + piUser.uid,
      piUID: piUser.uid,
      username: piUser.username,
      email: '',
      phone: '',
      country: 'US',
      language: 'en',
      walletAddress: '',
      gameAccounts: {},
      profileImageUrl: null,
      isProfileVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Generate a mock JWT token
    const mockToken = 'mock-jwt-token-' + Date.now();

    response.status(200).json({
      user: mockUser,
      token: mockToken
    });
  } catch (error) {
    console.error('Pi authentication error:', error);
    response.status(500).json({ message: 'Authentication failed' });
  }
}