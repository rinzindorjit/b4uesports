import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStorage, getPricingService } from './_utils.js';

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
    // Get services dynamically
    const storage = await getStorage();
    const pricingService = await getPricingService();
    
    const packages = await storage.getActivePackages();
    const currentPiPrice = await pricingService.getCurrentPiPrice();

    const packagesWithPiPricing = packages.map((pkg: any) => ({
      ...pkg,
      piPrice: pricingService.calculatePiAmount(parseFloat(pkg.usdtValue)),
      currentPiPrice,
    }));

    return response.status(200).json(packagesWithPiPricing);
  } catch (error) {
    console.error('Packages fetch error:', error);
    return response.status(500).json({ message: 'Failed to fetch packages' });
  }
}