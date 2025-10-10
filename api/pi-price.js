export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET allowed for /api/pi-price" });
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4"
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const price = data["pi-network"]?.usd ?? 0.24069;

    return res.status(200).json({
      price,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Pi price error:", error);
    return res.status(200).json({
      price: 0.24069,
      lastUpdated: new Date().toISOString(),
    });
  }
}