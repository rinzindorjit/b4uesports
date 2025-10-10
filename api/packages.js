// Package data
const packages = [
  { id: "pubg-60", game: "PUBG", name: "60 UC", inGameAmount: 60, usdtValue: 1.5, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
  { id: "pubg-325", game: "PUBG", name: "325 UC", inGameAmount: 325, usdtValue: 6.5, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
  { id: "pubg-660", game: "PUBG", name: "660 UC", inGameAmount: 660, usdtValue: 12, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
  { id: "pubg-1800", game: "PUBG", name: "1800 UC", inGameAmount: 1800, usdtValue: 25, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
  { id: "pubg-3850", game: "PUBG", name: "3850 UC", inGameAmount: 3850, usdtValue: 49, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
  { id: "pubg-8100", game: "PUBG", name: "8100 UC", inGameAmount: 8100, usdtValue: 96, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
  { id: "pubg-16200", game: "PUBG", name: "16200 UC", inGameAmount: 16200, usdtValue: 186, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
  { id: "pubg-24300", game: "PUBG", name: "24300 UC", inGameAmount: 24300, usdtValue: 278, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
  { id: "pubg-32400", game: "PUBG", name: "32400 UC", inGameAmount: 32400, usdtValue: 369, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
  { id: "pubg-40500", game: "PUBG", name: "40500 UC", inGameAmount: 40500, usdtValue: 459, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },

  { id: "mlbb-56", game: "MLBB", name: "56 Diamonds", inGameAmount: 56, usdtValue: 3, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true },
  { id: "mlbb-278", game: "MLBB", name: "278 Diamonds", inGameAmount: 278, usdtValue: 6, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true },
  { id: "mlbb-571", game: "MLBB", name: "571 Diamonds", inGameAmount: 571, usdtValue: 11, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true },
  { id: "mlbb-1783", game: "MLBB", name: "1783 Diamonds", inGameAmount: 1783, usdtValue: 33, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true },
  { id: "mlbb-3005", game: "MLBB", name: "3005 Diamonds", inGameAmount: 3005, usdtValue: 52, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true },
  { id: "mlbb-6012", game: "MLBB", name: "6012 Diamonds", inGameAmount: 6012, usdtValue: 99, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true },
  { id: "mlbb-12000", game: "MLBB", name: "12000 Diamonds", inGameAmount: 12000, usdtValue: 200, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true }
];

// Function to fetch Pi price from CoinGecko
async function fetchPiPrice() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4",
      { timeout: 5000 }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const price = data["pi-network"]?.usd;
    
    if (typeof price !== "number") throw new Error("Invalid price data");
    
    return price;
  } catch (error) {
    console.error("Failed to fetch Pi price from CoinGecko:", error);
    // Return fallback price
    return 0.24069;
  }
}

// Function to calculate Pi amount
function calculatePiAmount(usdtValue, piPrice) {
  return parseFloat((usdtValue / piPrice).toFixed(8));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      // Fetch live Pi price
      const currentPiPrice = await fetchPiPrice();
      
      // Add Pi price to each package
      const packagesWithPiPricing = packages.map(pkg => ({
        ...pkg,
        piPrice: calculatePiAmount(pkg.usdtValue, currentPiPrice),
        currentPiPrice,
      }));
      
      return res.status(200).json(packagesWithPiPricing);
    } catch (error) {
      console.error("Packages fetch error:", error);
      return res.status(500).json({ message: "Failed to fetch packages" });
    }
  }

  return res.status(405).json({ message: "Only GET allowed" });
}