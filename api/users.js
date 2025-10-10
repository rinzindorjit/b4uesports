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

// api/users.ts
var users_exports = {};
__export(users_exports, {
  default: () => handler
});
module.exports = __toCommonJS(users_exports);

// api/_utils.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_bcrypt = __toESM(require("bcrypt"));
var JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-secret";

// api/users.ts
var import_node_fetch = __toESM(require("node-fetch"));
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
  users: {},
  transactions: [],
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
  const PI_API_KEY = process.env.PI_API_KEY;
  if (!PI_API_KEY) {
    console.error("\u274C Missing PI_API_KEY environment variable");
    return res.status(500).json({
      message: "Server configuration error: Missing PI_API_KEY"
    });
  }
  const PI_SANDBOX = String(process.env.PI_SANDBOX || "").toLowerCase() === "true";
  const PI_SERVER_URL = PI_SANDBOX ? "https://sandbox.minepi.com/v2" : "https://api.minepi.com/v2";
  console.log("Pi Network mode: " + (PI_SANDBOX ? "SANDBOX (Testnet)" : "PRODUCTION"));
  console.log("Pi Network endpoint: " + PI_SERVER_URL);
  try {
    if (method === "POST") {
      const body = await readBody(req);
      if (body.action === "authenticate") {
        const { accessToken } = body.data;
        console.log("Attempting to verify access token:", accessToken ? "Token provided" : "No token");
        if (!accessToken) {
          return res.status(400).json({ message: "Missing access token" });
        }
        try {
          const response = await (0, import_node_fetch.default)(`${PI_SERVER_URL}/me`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
              // Removed X-API-Key header as it's not needed for /me endpoint
            }
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Pi Network verification failed:", errorData);
            throw new Error(`Pi Network verification failed: ${response.status} ${response.statusText}`);
          }
          const userData = await response.json();
          console.log("User data verified:", userData);
          const userId = userData.uid;
          if (!store.users[userId]) {
            store.users[userId] = {
              id: userId,
              username: userData.username,
              email: "",
              phone: "",
              country: "",
              language: "",
              walletAddress: userData.wallet_address || "",
              profileImage: "",
              gameAccounts: {},
              referralCode: ""
            };
          }
          store.users[userId] = {
            ...store.users[userId],
            username: userData.username,
            walletAddress: userData.wallet_address || ""
          };
          const token = import_jsonwebtoken.default.sign({
            pi_id: userId,
            username: userData.username
          }, process.env.JWT_SECRET || "fallback-secret");
          console.log("JWT token generated");
          return res.status(200).json({
            message: "User authenticated",
            user: store.users[userId],
            token
          });
        } catch (error) {
          console.error("Authentication error:", error.stack || error);
          return res.status(401).json({
            message: "Invalid Pi Network token",
            error: error.message
          });
        }
      }
      if (body.action === "getProfile") {
        try {
          const token = getToken(req);
          const decoded = import_jsonwebtoken.default.verify(token, process.env.JWT_SECRET || "fallback-secret");
          const user = store.users[decoded.pi_id];
          return res.status(200).json({ user });
        } catch (error) {
          return res.status(401).json({ message: "Invalid token" });
        }
      }
      return res.status(400).json({ message: "Invalid action for /api/users" });
    }
    if (method === "GET") {
      try {
        const token = getToken(req);
        const decoded = import_jsonwebtoken.default.verify(token, process.env.JWT_SECRET || "fallback-secret");
        const user = store.users[decoded.pi_id];
        return res.status(200).json({ user });
      } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
    return res.status(405).json({ message: "Method not allowed. Only POST and GET requests are allowed." });
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
