// @ts-nocheck

// Updated store with all packages
const store = {
  users: {},
  transactions: [],
  packages: [
    // PUBG Packages - removed specified packages
    { 
      id: 'pubg-4', 
      game: 'PUBG', 
      name: '1800 UC Pack', 
      inGameAmount: 1800, 
      usdtValue: '25.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    { 
      id: 'pubg-5', 
      game: 'PUBG', 
      name: '3850 UC Pack', 
      inGameAmount: 3850, 
      usdtValue: '49.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    { 
      id: 'pubg-6', 
      game: 'PUBG', 
      name: '8100 UC Pack', 
      inGameAmount: 8100, 
      usdtValue: '96.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    { 
      id: 'pubg-7', 
      game: 'PUBG', 
      name: '16200 UC Pack', 
      inGameAmount: 16200, 
      usdtValue: '186.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    { 
      id: 'pubg-8', 
      game: 'PUBG', 
      name: '24300 UC Pack', 
      inGameAmount: 24300, 
      usdtValue: '278.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    // MLBB Packages - removed specified packages
    { 
      id: 'mlbb-3', 
      game: 'MLBB', 
      name: '571 Diamonds Pack', 
      inGameAmount: 571, 
      usdtValue: '11.0000',
      image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png',
      isActive: true 
    },
    { 
      id: 'mlbb-4', 
      game: 'MLBB', 
      name: '1783 Diamonds Pack', 
      inGameAmount: 1783, 
      usdtValue: '33.0000',
      image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png',
      isActive: true 
    },
    { 
      id: 'mlbb-5', 
      game: 'MLBB', 
      name: '3005 Diamonds Pack', 
      inGameAmount: 3005, 
      usdtValue: '52.0000',
      image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png',
      isActive: true 
    },
    { 
      id: 'mlbb-6', 
      game: 'MLBB', 
      name: '6012 Diamonds Pack', 
      inGameAmount: 6012, 
      usdtValue: '99.0000',
      image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png',
      isActive: true 
    },
    { 
      id: 'mlbb-7', 
      game: 'MLBB', 
      name: '12000 Diamonds Pack', 
      inGameAmount: 12000, 
      usdtValue: '200.0000',
      image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png',
      isActive: true 
    },
  ],
  payments: [],
};

// Helper function to calculate Pi amount from USD value
function calculatePiAmount(usdValue, piPrice) {
  if (!usdValue || !piPrice) return null;
  return usdValue / piPrice;
}

function getStorage() {
  return store;
}

async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { method } = req;
  const store = getStorage();

  try {
    if (method === "GET") {
      // Get current Pi price
      let piPrice = 0.24069; // Default fallback price
      try {
        const piPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4');
        const piPriceData = await piPriceResponse.json();
        piPrice = piPriceData['pi-network']?.usd || piPrice;
      } catch (error) {
        console.error('Failed to fetch Pi price for packages:', error);
      }
      
      // Add Pi pricing information to packages
      const packagesWithPricing = store.packages.map(pkg => ({
        ...pkg,
        piPrice: calculatePiAmount(parseFloat(pkg.usdtValue), piPrice),
        currentPiPrice: piPrice
      }));
      
      return res.status(200).json(packagesWithPricing);
    }
    return res.status(405).json({ message: "Only GET allowed for /api/packages" });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
}

module.exports = handler;