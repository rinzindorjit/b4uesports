// @ts-nocheck

// Production-ready Pi price handler
export default async function handler(req, res) {
  // Set CORS headers - restrict in production
  const allowedOrigin = process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.com' 
    : '*';
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400"); // Cache preflight requests for 24 hours
  
  // Handle preflight requests
  if (req.method === "OPTIONS") return res.status(200).end();
  
  const { method } = req;

  if (method === "GET") {
    try {
      // Use CoinGecko API to get the current Pi price with demo key
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4');
      
      // Check if response is OK before parsing JSON
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      }
      
      // Validate Content-Type header from CoinGecko
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`CoinGecko returned invalid content type: ${contentType}`);
      }
      
      // Use safer approach to parse JSON - let the fetch API handle it first
      let data;
      try {
        data = await response.json();
      } catch (parseError: any) {
        throw new Error(`Invalid JSON from CoinGecko: ${parseError.message}`);
      }
      
      const price = data['pi-network']?.usd;

      if (typeof price !== 'number') {
        throw new Error('Invalid price data received from CoinGecko');
      }

      return res.status(200).json({
        price: price,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to fetch Pi price from CoinGecko:', error.stack || error);
      
      // Fallback to fixed price if API fails
      const fixedPrice = 0.24069;
      return res.status(200).json({
        price: fixedPrice,
        lastUpdated: new Date().toISOString()
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed. Only GET requests are allowed." });
}