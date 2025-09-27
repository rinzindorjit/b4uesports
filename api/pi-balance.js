// /api/pi-balance.js
// Dedicated handler for Pi balance endpoint

export default async function handler(req, res) {
  try {
    console.log("Routing to /api/pi-balance endpoint");
    
    // Mock balance for testnet
    const balance = 1000.0;
    
    // Add a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = { 
      balance: balance,
      currency: "PI",
      lastUpdated: new Date().toISOString(),
      isTestnet: true
    };
    
    console.log("Balance response:", JSON.stringify(response));
    return res.status(200).json(response);

  } catch (error) {
    console.error("API handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}