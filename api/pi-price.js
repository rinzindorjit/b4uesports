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
var pi_price_exports = {};
__export(pi_price_exports, {
  default: () => handler
});
module.exports = __toCommonJS(pi_price_exports);
var import_supabase_js = require("@supabase/supabase-js");
async function handler(req, res) {
  const allowedOrigin = process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL || "https://yourdomain.com" : "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.status(200).end();
  const { method } = req;
  if (method === "GET") {
    try {
      console.log("Fetching Pi price...");
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log("Attempting to fetch Pi price from Supabase...");
        return await fetchPriceFromSupabase(req, res);
      }
      console.log("Attempting to fetch Pi price from CoinGecko...");
      return await fetchPriceFromCoinGecko(req, res);
    } catch (error) {
      console.error("Failed to fetch Pi price:", error.stack || error);
      const fixedPrice = 0.24069;
      console.log("Using fixed fallback price:", fixedPrice);
      return res.status(200).json({
        price: fixedPrice,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        source: "fixed",
        message: "Using fixed price due to all API failures"
      });
    }
  }
  return res.status(405).json({ message: "Method not allowed. Only GET requests are allowed." });
}
async function fetchPriceFromSupabase(req, res) {
  try {
    const supabase = (0, import_supabase_js.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data, error } = await supabase.from("pi_prices").select("price, created_at").order("created_at", { ascending: false }).limit(1).single();
    if (error) {
      console.error("Supabase query error:", error.message);
      throw new Error(`Supabase error: ${error.message}`);
    }
    if (!data) {
      console.log("No price data found in Supabase, falling back to CoinGecko");
      throw new Error("No price data in Supabase");
    }
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1e3);
    const priceDate = new Date(data.created_at);
    if (priceDate < oneHourAgo) {
      console.log("Supabase price is outdated, falling back to CoinGecko");
      throw new Error("Outdated price in Supabase");
    }
    console.log("Successfully fetched Pi price from Supabase:", data.price);
    return res.status(200).json({
      price: data.price,
      lastUpdated: data.created_at,
      source: "supabase"
    });
  } catch (error) {
    console.error("Supabase fetch failed:", error.message);
    throw error;
  }
}
async function fetchPriceFromCoinGecko(req, res) {
  try {
    const coingeckoApiKey = process.env.COINGECKO_API_KEY || "CG-z4MZkBd78fn7PgPhPYcKq1r4";
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=${coingeckoApiKey}`;
    console.log("Using CoinGecko API key:", coingeckoApiKey.substring(0, 5) + "...");
    console.log("Request URL:", url.replace(coingeckoApiKey, coingeckoApiKey.substring(0, 5) + "..."));
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "B4U-Esports-Pi-App/1.0"
      }
    });
    console.log("CoinGecko response status:", response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("CoinGecko API error response:", errorText);
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const contentType = response.headers.get("content-type");
    console.log("Response content-type:", contentType);
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error("Non-JSON response:", textResponse);
      throw new Error(`CoinGecko returned invalid content type: ${contentType}`);
    }
    let data;
    try {
      data = await response.json();
      console.log("CoinGecko response data:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      const textResponse = await response.text();
      console.error("Failed to parse JSON response:", textResponse);
      throw new Error(`Invalid JSON from CoinGecko: ${parseError.message}`);
    }
    const price = data["pi-network"]?.usd;
    if (typeof price !== "number") {
      throw new Error("Invalid price data received from CoinGecko: " + JSON.stringify(data));
    }
    console.log("Successfully fetched Pi price from CoinGecko:", price);
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = (0, import_supabase_js.createClient)(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        await supabase.from("pi_prices").insert({
          price,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        });
        console.log("Saved Pi price to Supabase for future use");
      } catch (saveError) {
        console.error("Failed to save price to Supabase:", saveError.message);
      }
    }
    return res.status(200).json({
      price,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      source: "coingecko"
    });
  } catch (error) {
    console.error("CoinGecko fetch failed:", error.stack || error);
    throw error;
  }
}
