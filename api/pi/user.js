// Pi Network user management endpoint for Vercel
export default async function handler(request, response) {
  if (request.method === 'GET') {
    // Get user info
    try {
      // For mock purposes, return mock user data
      const mockUser = {
        id: 'mock-user-' + Date.now(),
        piUID: 'mock-pi-uid',
        username: 'mock_user',
        email: 'mock@example.com',
        phone: '+1234567890',
        country: 'US',
        language: 'en',
        walletAddress: 'mock-wallet-address',
        gameAccounts: {},
        profileImageUrl: null,
        isProfileVerified: true, // Set to true for mock
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      response.status(200).json(mockUser);
    } catch (error) {
      console.error('User fetch error:', error);
      response.status(500).json({ message: 'Failed to fetch user' });
    }
  } else if (request.method === 'PUT') {
    // Update user profile
    try {
      const userData = request.body;
      
      // For mock purposes, return the updated user data
      // Check if profile is being completed (email and phone provided)
      const isProfileVerified = userData.email && userData.phone;
      
      const updatedUser = {
        id: 'mock-user-' + Date.now(),
        ...userData,
        isProfileVerified: isProfileVerified,
        updatedAt: new Date().toISOString()
      };

      response.status(200).json(updatedUser);
    } catch (error) {
      console.error('User update error:', error);
      response.status(500).json({ message: 'Failed to update user' });
    }
  } else {
    response.status(405).json({ message: 'Method not allowed' });
  }
}