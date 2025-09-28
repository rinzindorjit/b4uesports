import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, getStorage } from './_utils';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authHeader = request.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return response.status(401).json({ message: 'No token provided' });
    }

    // Get service dynamically
    const storage = await getStorage();

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const transactions = await storage.getUserTransactions(userId);
    return response.status(200).json(transactions);
  } catch (error) {
    console.error('Transactions fetch error:', error);
    return response.status(500).json({ message: 'Failed to fetch transactions' });
  }
}