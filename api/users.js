import { readBody, getStorage, jwtSign, jwtVerify } from "./utils";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const store = getStorage();
  
  // Handle authentication endpoint
  if (req.method === "POST") {
    const body = await readBody(req);
    
    // Handle authentication action
    if (body.action === 'authenticate') {
      try {
        // In a real implementation, you would verify the accessToken with Pi Network
        // For this example, we'll create a mock user
        const mockUser = {
          id: `user_${Date.now()}`,
          username: 'testuser',
          email: 'test@example.com',
          phone: '',
          country: 'US',
          language: 'en',
          walletAddress: 'GCKMLPC456789012345678901234567890123456789',
          profileImage: '',
          gameAccounts: {
            pubg: { ign: '', uid: '' },
            mlbb: { userId: '', zoneId: '' }
          },
          referralCode: ''
        };
        
        // Add user to storage if not exists
        const existingUserIndex = store.users.findIndex(u => u.id === mockUser.id);
        if (existingUserIndex === -1) {
          store.users.push(mockUser);
        } else {
          // Update existing user
          store.users[existingUserIndex] = mockUser;
        }
        
        // Create JWT token
        const token = jwtSign({ userId: mockUser.id });
        
        return res.status(200).json({
          user: mockUser,
          token: token
        });
      } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Authentication failed' });
      }
    }
  }
  
  // Handle authenticated requests
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwtVerify(token);
    const userId = decoded.userId;
    
    if (req.method === "GET") {
      // Handle session validation
      if (req.query && req.query.action === 'me') {
        const user = store.users.find(u => u.id === userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
      }
      
      // Handle regular user fetch
      const user = store.users.find(u => u.id === userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.status(200).json(user);
    }
    
    if (req.method === "PUT") {
      const body = await readBody(req);
      const userIndex = store.users.findIndex(u => u.id === userId);
      if (userIndex === -1) return res.status(404).json({ message: "User not found" });
      
      // Update user data
      store.users[userIndex] = { ...store.users[userIndex], ...body };
      return res.status(200).json(store.users[userIndex]);
    }
    
    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}