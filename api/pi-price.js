"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/pi-price.ts
var pi_price_exports = {};
__export(pi_price_exports, {
  default: () => handler
});
module.exports = __toCommonJS(pi_price_exports);
async function handler(req, res) {
  try {
    const allowedOrigin = process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL || "*" : "*";
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Max-Age", "86400");
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed. Only GET requests allowed." });
    }
    console.log("Fetching Pi price...");
    return await fetchPriceFromCoinGecko(res);
  } catch (error) {
    console.error("API handler error:", error.stack || error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
}
async function fetchPriceFromCoinGecko(res) {
  try {
    const coingeckoApiKey = process.env.COINGECKO_API_KEY || "CG-z4MZkBd78fn7PgPhPYcKq1r4";
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=${coingeckoApiKey}`;
    console.log(
      "Using CoinGecko API key:",
      coingeckoApiKey.substring(0, 5) + "..."
    );
    console.log("Request URL:", url);
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "B4U-Esports-Pi-App/1.0"
      }
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
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      source: "coingecko"
    });
  } catch (error) {
    console.error("CoinGecko fetch failed:", error.stack || error);
    return res.status(500).json({
      error: "CoinGecko API Failure",
      message: error.message
    });
  }
}
