// @ts-nocheck
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Use CoinGecko API to get the current Pi price with demo key
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4');
    const data = await response.json();
    const price = data['pi-network']?.usd;
    
    if (typeof price !== 'number') {
      throw new Error('Invalid price data received from CoinGecko');
    }
    
    return res.status(200).json({ 
      price: price, 
      lastUpdated: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Failed to fetch Pi price from CoinGecko:', error);
    // Fallback to fixed price if API fails
    const fixedPrice = 0.24069;
    return res.status(200).json({ 
      price: fixedPrice, 
      lastUpdated: new Date().toISOString() 
    });
  }
}