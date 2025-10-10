"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/transactions.ts
var transactions_exports = {};
__export(transactions_exports, {
  default: () => handler
});
module.exports = __toCommonJS(transactions_exports);

// api/_utils.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_bcrypt = __toESM(require("bcrypt"));
var JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-secret";

// api/transactions.ts
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => data += chunk);
    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (err) {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}
function getToken(req) {
  const auth = req.headers["authorization"];
  if (!auth) throw new Error("Missing Authorization header");
  return auth.replace("Bearer ", "");
}
var mockStorage = {
  transactions: [],
  users: {},
  packages: {}
};
async function handler(req, res) {
  const allowedOrigin = process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL || "https://yourdomain.com" : "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") return res.status(200).end();
  const { method } = req;
  const store = mockStorage;
  try {
    if (method === "GET") {
      try {
        const token = getToken(req);
        const decoded = import_jsonwebtoken.default.verify(token, process.env.JWT_SECRET || "fallback-secret");
        const userTransactions = store.transactions.filter((txn) => txn.userId === decoded.pi_id);
        return res.status(200).json({ transactions: userTransactions });
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
    if (method === "POST") {
      try {
        const token = getToken(req);
        const decoded = import_jsonwebtoken.default.verify(token, process.env.JWT_SECRET || "fallback-secret");
        const body = await readBody(req);
        if (body.action === "create") {
          const { packageId, gameAccount, piAmount, usdAmount, piPriceAtTime } = body.data;
          if (!packageId || !piAmount || !usdAmount || !piPriceAtTime) {
            return res.status(400).json({ message: "Missing required fields" });
          }
          const newTransaction = {
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: decoded.pi_id,
            packageId,
            paymentId: "",
            txid: "",
            piAmount: piAmount.toString(),
            usdAmount: usdAmount.toString(),
            piPriceAtTime: piPriceAtTime.toString(),
            status: "pending",
            gameAccount: gameAccount || {},
            emailSent: false,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          store.transactions.push(newTransaction);
          return res.status(200).json({
            message: "Transaction created",
            transaction: newTransaction
          });
        }
        return res.status(400).json({ message: "Invalid action" });
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
    return res.status(405).json({ message: "Method not allowed. Only GET and POST requests are allowed." });
  } catch (err) {
    console.error("API Error:", err.stack || err);
    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? {
        message: err.message,
        stack: err.stack,
        name: err.name
      } : void 0
    });
  }
}
