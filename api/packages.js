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

// api/packages.ts
var packages_exports = {};
__export(packages_exports, {
  default: () => handler
});
module.exports = __toCommonJS(packages_exports);
async function handler(req, res) {
  const allowedOrigin = process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL || "https://yourdomain.com" : "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.status(200).end();
  const { method } = req;
  const mockStorage = {
    packages: [
      // PUBG Packages
      { id: "pubg-uc50", game: "PUBG", name: "50 UC", inGameAmount: 50, usdtValue: "0.99", image: "/images/pubg-small.jpg", isActive: true, piPrice: 5 },
      { id: "pubg-uc100", game: "PUBG", name: "100 UC", inGameAmount: 100, usdtValue: "1.99", image: "/images/pubg-small.jpg", isActive: true, piPrice: 10 },
      { id: "pubg-uc200", game: "PUBG", name: "200 UC", inGameAmount: 200, usdtValue: "3.99", image: "/images/pubg-medium.jpg", isActive: true, piPrice: 20 },
      { id: "pubg-uc400", game: "PUBG", name: "400 UC", inGameAmount: 400, usdtValue: "7.99", image: "/images/pubg-medium.jpg", isActive: true, piPrice: 40 },
      { id: "pubg-uc800", game: "PUBG", name: "800 UC", inGameAmount: 800, usdtValue: "15.99", image: "/images/pubg-large.jpg", isActive: true, piPrice: 80 },
      { id: "pubg-uc1600", game: "PUBG", name: "1600 UC", inGameAmount: 1600, usdtValue: "31.99", image: "/images/pubg-large.jpg", isActive: true, piPrice: 160 },
      { id: "pubg-uc2000", game: "PUBG", name: "2000 UC", inGameAmount: 2e3, usdtValue: "39.99", image: "/images/pubg-large.jpg", isActive: true, piPrice: 200 },
      { id: "pubg-uc4000", game: "PUBG", name: "4000 UC", inGameAmount: 4e3, usdtValue: "79.99", image: "/images/pubg-large.jpg", isActive: true, piPrice: 400 },
      // MLBB Packages
      { id: "mlbb-diamond10", game: "MLBB", name: "10 Diamond", inGameAmount: 10, usdtValue: "0.99", image: "/images/mlbb-small.jpg", isActive: true, piPrice: 5 },
      { id: "mlbb-diamond50", game: "MLBB", name: "50 Diamond", inGameAmount: 50, usdtValue: "4.99", image: "/images/mlbb-small.jpg", isActive: true, piPrice: 25 },
      { id: "mlbb-diamond100", game: "MLBB", name: "100 Diamond", inGameAmount: 100, usdtValue: "9.99", image: "/images/mlbb-medium.jpg", isActive: true, piPrice: 50 },
      { id: "mlbb-diamond200", game: "MLBB", name: "200 Diamond", inGameAmount: 200, usdtValue: "19.99", image: "/images/mlbb-medium.jpg", isActive: true, piPrice: 100 },
      { id: "mlbb-diamond400", game: "MLBB", name: "400 Diamond", inGameAmount: 400, usdtValue: "39.99", image: "/images/mlbb-large.jpg", isActive: true, piPrice: 200 },
      { id: "mlbb-diamond800", game: "MLBB", name: "800 Diamond", inGameAmount: 800, usdtValue: "79.99", image: "/images/mlbb-large.jpg", isActive: true, piPrice: 400 },
      { id: "mlbb-diamond1000", game: "MLBB", name: "1000 Diamond", inGameAmount: 1e3, usdtValue: "99.99", image: "/images/mlbb-large.jpg", isActive: true, piPrice: 500 },
      { id: "mlbb-diamond2000", game: "MLBB", name: "2000 Diamond", inGameAmount: 2e3, usdtValue: "199.99", image: "/images/mlbb-large.jpg", isActive: true, piPrice: 1e3 }
    ]
  };
  try {
    if (method === "GET") {
      return res.status(200).json(mockStorage.packages);
    }
    return res.status(405).json({ message: "Method not allowed. Only GET requests are allowed." });
  } catch (err) {
    console.error("API Error:", err.stack || err);
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? err.message : void 0
    });
  }
}
