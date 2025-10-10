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
      console.log("Fetching Pi price from CoinGecko...");
      
      // Use environment variable for CoinGecko API key if available, otherwise use demo key
      const coingeckoApiKey = process.env.COINGECKO_API_KEY || 'CG-z4MZkBd78fn7PgPhPYcKq1r4';
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=${coingeckoApiKey}`;
      
      console.log("Using API key:", coingeckoApiKey.substring(0, 5) + '...');
      console.log("Request URL:", url.replace(coingeckoApiKey, coingeckoApiKey.substring(0, 5) + '...'));
      
      // Use CoinGecko API to get the current Pi price
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'B4U-Esports-Pi-App/1.0'
        }
      });
      
      console.log("CoinGecko response status:", response.status);
      console.log("CoinGecko response headers:", [...response.headers.entries()]);
      
      // Check if response is OK before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("CoinGecko API error response:", errorText);
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Validate Content-Type header from CoinGecko
      const contentType = response.headers.get('content-type');
      console.log("Response content-type:", contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse);
        throw new Error(`CoinGecko returned invalid content type: ${contentType}`);
      }
      
      // Use safer approach to parse JSON - let the fetch API handle it first
      let data;
      try {
        data = await response.json();
        console.log("CoinGecko response data:", JSON.stringify(data, null, 2));
      } catch (parseError: any) {
        const textResponse = await response.text();
        console.error("Failed to parse JSON response:", textResponse);
        throw new Error(`Invalid JSON from CoinGecko: ${parseError.message}`);
      }
      
      const price = data['pi-network']?.usd;

      if (typeof price !== 'number') {
        throw new Error('Invalid price data received from CoinGecko: ' + JSON.stringify(data));
      }

      console.log("Successfully fetched Pi price:", price);
      
      return res.status(200).json({
        price: price,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to fetch Pi price from CoinGecko:', error.stack || error);
      
      // Fallback to fixed price if API fails
      const fixedPrice = 0.24069;
      console.log("Using fallback price:", fixedPrice);
      
      return res.status(200).json({
        price: fixedPrice,
        lastUpdated: new Date().toISOString(),
        source: 'fallback',
        message: 'Using fallback price due to API error'
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed. Only GET requests are allowed." });
}