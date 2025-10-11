import type { VercelRequest, VercelResponse } from '@vercel/node';

// Production-ready packages handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  
  // Mock storage for Vercel environment
  const mockStorage = {
    packages: [
      // PUBG Packages - Updated to match actual packages with correct piPrice values
      { id: 'pubg-60', game: 'PUBG', name: '60 UC', inGameAmount: 60, usdtValue: '1.5000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 6 },
      { id: 'pubg-325', game: 'PUBG', name: '325 UC', inGameAmount: 325, usdtValue: '6.5000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 27 },
      { id: 'pubg-660', game: 'PUBG', name: '660 UC', inGameAmount: 660, usdtValue: '12.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 50 },
      { id: 'pubg-1800', game: 'PUBG', name: '1800 UC', inGameAmount: 1800, usdtValue: '25.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 104 },
      { id: 'pubg-3850', game: 'PUBG', name: '3850 UC', inGameAmount: 3850, usdtValue: '49.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 204 },
      { id: 'pubg-8100', game: 'PUBG', name: '8100 UC', inGameAmount: 8100, usdtValue: '96.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 399 },
      { id: 'pubg-16200', game: 'PUBG', name: '16200 UC', inGameAmount: 16200, usdtValue: '186.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 773 },
      { id: 'pubg-24300', game: 'PUBG', name: '24300 UC', inGameAmount: 24300, usdtValue: '278.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 1155 },
      { id: 'pubg-32400', game: 'PUBG', name: '32400 UC', inGameAmount: 32400, usdtValue: '369.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 1533 },
      { id: 'pubg-40500', game: 'PUBG', name: '40500 UC', inGameAmount: 40500, usdtValue: '459.0000', image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png', isActive: true, piPrice: 1907 },
      
      // MLBB Packages - Updated to match actual packages with correct piPrice values
      { id: 'mlbb-56', game: 'MLBB', name: '56 Diamonds', inGameAmount: 56, usdtValue: '3.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 12 },
      { id: 'mlbb-278', game: 'MLBB', name: '278 Diamonds', inGameAmount: 278, usdtValue: '6.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 25 },
      { id: 'mlbb-571', game: 'MLBB', name: '571 Diamonds', inGameAmount: 571, usdtValue: '11.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 46 },
      { id: 'mlbb-1783', game: 'MLBB', name: '1783 Diamonds', inGameAmount: 1783, usdtValue: '33.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 137 },
      { id: 'mlbb-3005', game: 'MLBB', name: '3005 Diamonds', inGameAmount: 3005, usdtValue: '52.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 216 },
      { id: 'mlbb-6012', game: 'MLBB', name: '6012 Diamonds', inGameAmount: 6012, usdtValue: '99.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 411 },
      { id: 'mlbb-12000', game: 'MLBB', name: '12000 Diamonds', inGameAmount: 12000, usdtValue: '200.0000', image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png', isActive: true, piPrice: 831 }
    ]
  };

  try {
    if (method === "GET") {
      // Return the packages array directly instead of wrapping it in an object
      return res.status(200).json(mockStorage.packages);
    }
    return res.status(405).json({ message: "Method not allowed. Only GET requests are allowed." });
  } catch (err: any) {
    console.error("API Error:", err.stack || err);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
}