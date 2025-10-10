import { getStorage, saveStorage } from "./utils";

// Function to fetch Pi price from CoinGecko
async function fetchPiPrice() {
  try {
    // Use CoinGecko API to get the current Pi price with demo key
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4"
    );

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    // Validate Content-Type header from CoinGecko
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`CoinGecko returned invalid content type: ${contentType}`);
    }

    const data = await response.json();
    const price = data["pi-network"]?.usd;

    if (typeof price !== "number") throw new Error("Invalid price data");

    return {
      price,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to fetch Pi price from CoinGecko:", error);
    // Return null to indicate failure
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      const store = getStorage();
      let priceData = store.piPrice;
      
      // Check if we have price data and if it's recent (less than 1 hour old)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const isDataRecent = priceData && new Date(priceData.lastUpdated) > oneHourAgo;
      
      // If we don't have recent data, try to fetch new data
      if (!isDataRecent) {
        const freshPriceData = await fetchPiPrice();
        if (freshPriceData) {
          // Update stored data
          store.piPrice = freshPriceData;
          saveStorage(store);
          priceData = freshPriceData;
        }
      }
      
      // If we still don't have price data, return a default price
      if (!priceData) {
        return res.status(200).json({
          price: 0.24069, // Default/fallback price
          lastUpdated: new Date().toISOString()
        });
      }
      
      return res.status(200).json({
        price: priceData.price,
        lastUpdated: priceData.lastUpdated
      });
    } catch (error) {
      console.error("Pi price fetch error:", error);
      // Even in case of error, return a fallback price
      return res.status(200).json({
        price: 0.24069, // Default/fallback price
        lastUpdated: new Date().toISOString()
      });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}