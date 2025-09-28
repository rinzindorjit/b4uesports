import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    // Import modules dynamically to avoid issues with serverless environment
    const { pricingService } = await import('./_utils').then(mod => mod.importServerModules());

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