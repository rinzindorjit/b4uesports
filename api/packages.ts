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
      name: 'Small UC Pack', 
      inGameAmount: 100, 
      usdtValue: '10.00',
      image: '/images/pubg-small.jpg',
      isActive: true 
    },
    { 
      id: 'pubg-2', 
      game: 'PUBG', 
      name: 'Medium UC Pack', 
      inGameAmount: 250, 
      usdtValue: '25.00',
      image: '/images/pubg-medium.jpg',
      isActive: true 
    },
    { 
      id: 'pubg-3', 
      game: 'PUBG', 
      name: 'Large UC Pack', 
      inGameAmount: 500, 
      usdtValue: '50.00',
      image: '/images/pubg-large.jpg',
      isActive: true 
    },
    // MLBB Packages
    { 
      id: 'mlbb-1', 
      game: 'MLBB', 
      name: 'Small Diamond Pack', 
      inGameAmount: 50, 
      usdtValue: '10.00',
      image: '/images/mlbb-small.jpg',
      isActive: true 
    },
    { 
      id: 'mlbb-2', 
      game: 'MLBB', 
      name: 'Medium Diamond Pack', 
      inGameAmount: 125, 
      usdtValue: '25.00',
      image: '/images/mlbb-medium.jpg',
      isActive: true 
    },
    { 
      id: 'mlbb-3', 
      game: 'MLBB', 
      name: 'Large Diamond Pack', 
      inGameAmount: 250, 
      usdtValue: '50.00',
      image: '/images/mlbb-large.jpg',
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