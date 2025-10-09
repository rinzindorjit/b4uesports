// @ts-nocheck

// Inline the getStorage function directly
const store = {
  users: {},
  transactions: [],
  packages: [
    // PUBG Packages
    { 
      id: 'pubg-1', 
      game: 'PUBG', 
      name: '60 UC Pack', 
      inGameAmount: 60, 
      usdtValue: '1.5000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    { 
      id: 'pubg-2', 
      game: 'PUBG', 
      name: '325 UC Pack', 
      inGameAmount: 325, 
      usdtValue: '6.5000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    { 
      id: 'pubg-3', 
      game: 'PUBG', 
      name: '660 UC Pack', 
      inGameAmount: 660, 
      usdtValue: '12.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
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
    { 
      id: 'pubg-9', 
      game: 'PUBG', 
      name: '32400 UC Pack', 
      inGameAmount: 32400, 
      usdtValue: '369.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    { 
      id: 'pubg-10', 
      game: 'PUBG', 
      name: '40500 UC Pack', 
      inGameAmount: 40500, 
      usdtValue: '459.0000',
      image: 'https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png',
      isActive: true 
    },
    // MLBB Packages
    { 
      id: 'mlbb-1', 
      game: 'MLBB', 
      name: '56 Diamonds Pack', 
      inGameAmount: 56, 
      usdtValue: '3.0000',
      image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png',
      isActive: true 
    },
    { 
      id: 'mlbb-2', 
      game: 'MLBB', 
      name: '278 Diamonds Pack', 
      inGameAmount: 278, 
      usdtValue: '6.0000',
      image: 'https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png',
      isActive: true 
    },
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

function getStorage() {
  return store;
}

function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { method } = req;
  const store = getStorage();

  try {
    if (method === "GET") {
      // Return the packages array directly instead of wrapping it in an object
      return res.status(200).json(store.packages);
    }
    return res.status(405).json({ message: "Only GET allowed for /api/packages" });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
}

module.exports = handler;