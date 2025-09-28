import type { VercelRequest, VercelResponse } from '@vercel/node';
import { pricingService } from './_utils';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    if (request.method !== 'GET') {
      return response.status(405).json({ message: 'Method not allowed' });
    }

    const price = await pricingService.getCurrentPiPrice();
    const lastPrice = pricingService.getLastPrice();
    
    return response.status(200).json({
      price,
      lastUpdated: lastPrice?.lastUpdated || new Date(),
    });
  } catch (error) {
    console.error('Pi price fetch error:', error);
    return response.status(500).json({ message: 'Failed to fetch Pi price' });
  }
}