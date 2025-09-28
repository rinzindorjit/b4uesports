import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Export JWT_SECRET directly
export const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fallback-secret';

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

export {
  jwt,
  bcrypt,
};

// Dynamic import functions for Vercel serverless environment
export async function getStorage() {
  try {
    // Try to import from the server directory (works in Vercel)
    const storageModule = await import("../server/storage");
    return storageModule.storage;
  } catch (error) {
    try {
      // Fallback to import from dist/server directory (works in development)
      const storageModule = await import("../dist/server/storage");
      return storageModule.storage;
    } catch (fallbackError) {
      // Final fallback - rethrow original error
      console.error('Failed to import storage module:', error);
      throw error;
    }
  }
}

export async function getPricingService() {
  try {
    // Try to import from the server directory (works in Vercel)
    const pricingModule = await import("../server/services/pricing");
    return pricingModule.pricingService;
  } catch (error) {
    try {
      // Fallback to import from dist/server directory (works in development)
      const pricingModule = await import("../dist/server/services/pricing");
      return pricingModule.pricingService;
    } catch (fallbackError) {
      // Final fallback - rethrow original error
      console.error('Failed to import pricing service:', error);
      throw error;
    }
  }
}

export async function getPiNetworkService() {
  try {
    // Try to import from the server directory (works in Vercel)
    const piNetworkModule = await import("../server/services/pi-network");
    return piNetworkModule.piNetworkService;
  } catch (error) {
    try {
      // Fallback to import from dist/server directory (works in development)
      const piNetworkModule = await import("../dist/server/services/pi-network");
      return piNetworkModule.piNetworkService;
    } catch (fallbackError) {
      // Final fallback - rethrow original error
      console.error('Failed to import Pi Network service:', error);
      throw error;
    }
  }
}

export async function getEmailService() {
  try {
    // Try to import from the server directory (works in Vercel)
    const emailModule = await import("../server/services/email");
    return emailModule.sendPurchaseConfirmationEmail;
  } catch (error) {
    try {
      // Fallback to import from dist/server directory (works in development)
      const emailModule = await import("../dist/server/services/email");
      return emailModule.sendPurchaseConfirmationEmail;
    } catch (fallbackError) {
      // Final fallback - rethrow original error
      console.error('Failed to import email service:', error);
      throw error;
    }
  }
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
    // We need to get storage dynamically here
    const storage = await getStorage();
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