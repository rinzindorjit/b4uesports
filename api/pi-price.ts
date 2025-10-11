// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    const allowedOrigin =
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || "*"
        : "*";

    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Max-Age", "86400");

    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "GET") {
      return res
        .status(405)
        .json({ message: "Method not allowed. Only GET requests allowed." });
    }

    console.log("Fetching Pi price...");
    return await fetchPriceFromCoinGecko(res);
  } catch (error) {
    console.error("API handler error:", error.stack || error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}

async function fetchPriceFromCoinGecko(res: VercelResponse) {
  try {
    const coingeckoApiKey =
      process.env.COINGECKO_API_KEY || "CG-z4MZkBd78fn7PgPhPYcKq1r4";

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=${coingeckoApiKey}`;

    console.log(
      "Using CoinGecko API key:",
      coingeckoApiKey.substring(0, 5) + "..."
    );
    console.log("Request URL:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "B4U-Esports-Pi-App/1.0",
      },
    });

    console.log("CoinGecko response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("CoinGecko API error response:", errorText);
      throw new Error(
        `CoinGecko API error: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const data = await response.json();
    console.log("CoinGecko response data:", data);

    const price = data["pi-network"]?.usd;
    if (typeof price !== "number") {
      throw new Error("Invalid price data from CoinGecko");
    }

    return res.status(200).json({
      price,
      lastUpdated: new Date().toISOString(),
      source: "coingecko",
    });
  } catch (error) {
    console.error("CoinGecko fetch failed:", error.stack || error);
    // Fallback to fixed price if API fails - always return valid JSON
    const fixedPrice = 0.24069;
    return res.status(200).json({
      price: fixedPrice,
      lastUpdated: new Date().toISOString(),
      source: "fallback",
    });
  }
}