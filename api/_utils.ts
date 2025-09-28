import { storage } from '../server/storage';
import { pricingService } from '../server/services/pricing';
import { piNetworkService } from '../server/services/pi-network';
import { sendPurchaseConfirmationEmail } from '../server/services/email';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret';

// Helper function to create JSON responses
export function createResponse(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Helper function to handle errors
export function handleError(error: any, message: string = 'Internal Server Error') {
  console.error(message, error);
  return createResponse(500, { message });
}

// Authentication middleware
export async function authenticateUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return { error: createResponse(401, { message: 'No token provided' }) };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { user: decoded };
  } catch (error) {
    return { error: createResponse(401, { message: 'Invalid token' }) };
  }
}

// Admin authentication middleware
export async function authenticateAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return { error: createResponse(401, { message: 'No token provided' }) };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const admin = await storage.getAdminByUsername(decoded.username);
    if (!admin || !admin.isActive) {
      return { error: createResponse(401, { message: 'Invalid admin token' }) };
    }
    return { admin };
  } catch (error) {
    return { error: createResponse(401, { message: 'Invalid token' }) };
  }
}

export {
  storage,
  pricingService,
  piNetworkService,
  sendPurchaseConfirmationEmail,
  JWT_SECRET,
};