// /api/pi-price.js
// Dedicated handler for Pi price endpoint

export default async function handler(req, res) {
  try {
    console.log("Routing to /api/pi-price endpoint");
    
    // Mock price for testnet
    const price = 0.0009; // Using fixed price as fallback
    
    const response = { 
      price: price,
      lastUpdated: new Date().toISOString(),
      isTestnet: true
    };
    
    console.log("Price response:", JSON.stringify(response));
    return res.status(200).json(response);

  } catch (error) {
    console.error("API handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}