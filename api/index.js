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
var index_exports = {};
__export(index_exports, {
  default: () => handler
});
module.exports = __toCommonJS(index_exports);
var import_utils = require("./_utils");
var import_utils2 = require("./_utils");
function calculatePiAmount(usdValue, piPrice) {
  if (!usdValue || !piPrice) return null;
  return usdValue / piPrice;
}
async function handler(req, res) {
  const { url, method } = req;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (method === "OPTIONS") return res.status(200).end();
  try {
    if (url.includes("/pi-price")) {
      if (method === "GET") {
        try {
          const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4");
          const data = await response.json();
          const price = data["pi-network"]?.usd;
          if (typeof price !== "number") {
            throw new Error("Invalid price data received from CoinGecko");
          }
          return res.status(200).json({
            price,
            lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
          });
        } catch (error) {
          console.error("Failed to fetch Pi price from CoinGecko:", error);
          const fixedPrice = 0.24069;
          return res.status(200).json({
            price: fixedPrice,
            lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
      return res.status(405).json({ message: "Only GET allowed for /api/pi-price" });
    }
    if (url.includes("/health")) {
      if (method === "GET") {
        return res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
      }
      return res.status(405).json({ message: "Only GET allowed for /api/health" });
    }
    if (url.includes("/users")) {
      if (method === "GET") {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token provided" });
        try {
          const decoded = (0, import_utils.jwtVerify)(token);
          const store = (0, import_utils.getStorage)();
          const user = store.users[decoded.pi_id];
          if (!user) return res.status(404).json({ message: "User not found" });
          return res.status(200).json({ user });
        } catch (err) {
          console.error("Token verification failed:", err);
          return res.status(401).json({ message: "Invalid token" });
        }
      }
      if (method === "POST") {
        const body = await (0, import_utils2.readBody)(req);
        const { action, accessToken } = body;
        if (action === "login") {
          if (!accessToken) return res.status(400).json({ message: "Access token required" });
          try {
            const piResponse = await fetch("https://api.minepi.com/v2/me", {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              }
            });
            if (!piResponse.ok) {
              let errorMessage = "Unknown error";
              try {
                const errorData = await piResponse.json();
                errorMessage = errorData && errorData["message"] || errorMessage;
              } catch (e) {
                errorMessage = piResponse.statusText || errorMessage;
              }
              throw new Error(`Pi Network API error: ${piResponse.status} - ${errorMessage}`);
            }
            const userData = await piResponse.json();
            const piUser = {
              username: userData["username"],
              pi_id: userData["uid"],
              email: userData["email"] || ""
            };
            const store = (0, import_utils.getStorage)();
            if (!store.users[piUser.pi_id]) {
              store.users[piUser.pi_id] = {
                ...piUser,
                id: piUser.pi_id,
                createdAt: (/* @__PURE__ */ new Date()).toISOString()
              };
            }
            const token = (0, import_utils.jwtSign)(piUser);
            return res.status(200).json({ token, user: piUser });
          } catch (err) {
            console.error("Authentication failed:", err);
            return res.status(500).json({
              message: `Failed to verify Pi Network access token: ${err.message || "Unknown error"}`
            });
          }
        }
        return res.status(400).json({ message: "Invalid action for /api/users" });
      }
      return res.status(405).json({ message: "Method not allowed" });
    }
    if (url.includes("/packages")) {
      if (method === "GET") {
        const store = (0, import_utils.getStorage)();
        let piPrice = 0.24069;
        try {
          const piPriceResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4");
          const piPriceData = await piPriceResponse.json();
          piPrice = piPriceData["pi-network"]?.usd || piPrice;
        } catch (error) {
          console.error("Failed to fetch Pi price for packages:", error);
        }
        const packagesWithPricing = store.packages.map((pkg) => ({
          ...pkg,
          piPrice: calculatePiAmount(parseFloat(pkg.usdtValue), piPrice),
          currentPiPrice: piPrice
        }));
        return res.status(200).json(packagesWithPricing);
      }
      return res.status(405).json({ message: "Only GET allowed for /api/packages" });
    }
    if (url.includes("/payments")) {
      if (method === "POST") {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = (0, import_utils.jwtVerify)(token);
        const body = await (0, import_utils2.readBody)(req);
        const payment = {
          id: `pay_${Date.now()}`,
          user: decoded.pi_id,
          amount: body.amount,
          method: "Pi",
          date: /* @__PURE__ */ new Date()
        };
        const store = (0, import_utils.getStorage)();
        store.payments.push(payment);
        return res.status(200).json({ message: "Payment recorded", payment });
      }
      if (method === "GET") {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = (0, import_utils.jwtVerify)(token);
        const store = (0, import_utils.getStorage)();
        const userPayments = store.payments.filter((p) => p.user === decoded.pi_id);
        return res.status(200).json({ payments: userPayments });
      }
    }
    if (url.includes("/transactions")) {
      if (method === "POST") {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = (0, import_utils.jwtVerify)(token);
        const body = await (0, import_utils2.readBody)(req);
        const txn = {
          id: `txn_${Date.now()}`,
          user: decoded.pi_id,
          amount: body.amount,
          date: /* @__PURE__ */ new Date()
        };
        const store = (0, import_utils.getStorage)();
        store.transactions.push(txn);
        return res.status(200).json({ message: "Transaction added", txn });
      }
      if (method === "GET") {
        const token = req.headers.authorization?.split(" ")[1];
        const decoded = (0, import_utils.jwtVerify)(token);
        const store = (0, import_utils.getStorage)();
        const userTxns = store.transactions.filter((t) => t.user === decoded.pi_id);
        return res.status(200).json({ transactions: userTxns });
      }
    }
    if (url.includes("/data")) {
      const token = req.headers.authorization?.split(" ")[1];
      (0, import_utils.jwtVerify)(token);
      return res.status(200).json({ message: "Secure data accessed", timestamp: /* @__PURE__ */ new Date() });
    }
    return res.status(200).json({
      message: "B4U Esports Unified API Online",
      endpoints: [
        "/api/pi-price",
        "/api/users",
        "/api/packages",
        "/api/payments",
        "/api/transactions",
        "/api/health",
        "/api/data"
      ]
    });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
}
