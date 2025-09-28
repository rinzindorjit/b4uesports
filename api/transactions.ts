import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage, JWT_SECRET } from './_utils';
import jwt from 'jsonwebtoken';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    if (request.method !== 'GET') {
      return response.status(405).json({ message: 'Method not allowed' });
    }

    const authHeader = request.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return response.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const transactions = await storage.getUserTransactions(userId);
    return response.status(200).json(transactions);
  } catch (error) {
    console.error('Transactions fetch error:', error);
    return response.status(500).json({ message: 'Failed to fetch transactions' });
  }
}