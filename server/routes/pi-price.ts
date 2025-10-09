import express from "express";
const router = express.Router();

router.get("/pi-price", async (_req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (_req.method === "OPTIONS") return res.status(200).end();

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4"
    );

    const data = await response.json();
    const price = data["pi-network"]?.usd;

    if (typeof price !== "number") throw new Error("Invalid price data");

    return res.status(200).json({
      price,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch Pi price:", error);

    const fixedPrice = 0.24069;
    return res.status(200).json({
      price: fixedPrice,
      lastUpdated: new Date().toISOString(),
    });
  }
});

export default router;