import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authHeader = request.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return response.status(401).json({ message: 'No token provided' });
    }

    const { action, data } = request.body;
    
    const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret';
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Import modules dynamically to avoid issues with serverless environment
      const { storage } = await import('./_utils').then(mod => mod.importServerModules());
      
      const admin = await storage.getAdminByUsername(decoded.username);
      if (!admin || !admin.isActive) {
        return response.status(401).json({ message: 'Invalid admin token' });
      }
    } catch (error) {
      return response.status(401).json({ message: 'Invalid token' });
    }

    // Import modules dynamically to avoid issues with serverless environment
    const { storage } = await import('./_utils').then(mod => mod.importServerModules());

    switch (action) {
      case 'analytics':
        const analytics = await storage.getAnalytics();
        return response.status(200).json(analytics);

      case 'transactions':
        const transactions = await storage.getAllTransactions();
        return response.status(200).json(transactions);

      case 'packages':
        const packages = await storage.getPackages();
        return response.status(200).json(packages);

      case 'createPackage':
        // Assuming insertPackageSchema is available
        const packageData = data;
        const newPackage = await storage.createPackage(packageData);
        return response.status(200).json(newPackage);

      case 'updatePackage':
        const { id, updateData } = data;
        const updatedPackage = await storage.updatePackage(id, updateData);
        
        if (!updatedPackage) {
          return response.status(404).json({ message: 'Package not found' });
        }
        
        return response.status(200).json(updatedPackage);

      default:
        return response.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Admin operation error:', error);
    return response.status(500).json({ message: 'Admin operation failed' });
  }
}