import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage, pricingService } from './_utils';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    if (request.method !== 'GET') {
      return response.status(405).json({ message: 'Method not allowed' });
    }

    const packages = await storage.getActivePackages();
    const currentPiPrice = await pricingService.getCurrentPiPrice();

    const packagesWithPiPricing = packages.map(pkg => ({
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