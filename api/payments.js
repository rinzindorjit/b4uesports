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

// api/payments.ts
var payments_exports = {};
__export(payments_exports, {
  default: () => handler
});
module.exports = __toCommonJS(payments_exports);
var import_node_fetch = __toESM(require("node-fetch"));
console.log("\u{1F50D} DEBUG: process.env.PI_SANDBOX raw value:", process.env.PI_SANDBOX);
var PI_SANDBOX = String(process.env.PI_SANDBOX || "").toLowerCase() === "true";
console.log("\u{1F50D} DEBUG: PI_SANDBOX boolean value:", PI_SANDBOX);
var PI_SERVER_URL = PI_SANDBOX ? "https://sandbox.minepi.com/v2" : "https://api.minepi.com/v2";
console.log("\u{1F50D} DEBUG: PI_SERVER_URL:", PI_SERVER_URL);
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
function isValidPaymentId(paymentId) {
  return typeof paymentId === "string" && /^[a-zA-Z0-9-]+$/.test(paymentId);
}
async function handler(req, res) {
  const allowedOrigin = process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL || "https://yourdomain.com" : "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed. Only POST requests are allowed." });
  }
  const PI_API_KEY = process.env.PI_API_KEY;
  if (!PI_API_KEY) {
    console.error("\u274C Missing PI_API_KEY environment variable");
    return res.status(500).json({
      message: "Server configuration error: Missing PI_API_KEY"
    });
  }
  const PI_SANDBOX2 = String(process.env.PI_SANDBOX || "").toLowerCase() === "true";
  const PI_SERVER_URL2 = PI_SANDBOX2 ? "https://sandbox.minepi.com/v2" : "https://api.minepi.com/v2";
  console.log("Pi Network mode: " + (PI_SANDBOX2 ? "SANDBOX (Testnet)" : "PRODUCTION"));
  console.log("Pi Network endpoint: " + PI_SERVER_URL2);
  try {
    const body = await readBody(req);
    const { action, data } = body;
    if (!action) {
      return res.status(400).json({ message: "Missing action parameter" });
    }
    switch (action) {
      case "approve":
        try {
          if (!data || !data.paymentId) {
            return res.status(400).json({ message: "paymentId is required" });
          }
          const { paymentId } = data;
          if (!isValidPaymentId(paymentId)) {
            return res.status(400).json({ message: "Invalid paymentId format" });
          }
          console.log("Approving payment: " + paymentId);
          const response = await (0, import_node_fetch.default)(`${PI_SERVER_URL2}/payments/${paymentId}/approve`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Key ${PI_API_KEY}`
            },
            body: JSON.stringify({})
          });
          const approvalData = await response.json();
          if (!response.ok) {
            console.error(`\u274C Pi Network approval failed for ${paymentId}:`, approvalData);
            return res.status(response.status).json({
              message: "Pi Network approval failed",
              error: approvalData
            });
          }
          console.log("Payment approved: " + paymentId);
          return res.json({
            message: "Payment approved successfully",
            payment: approvalData
          });
        } catch (error) {
          console.error("\u274C Approval error:", error.stack || error);
          return res.status(500).json({
            message: "Payment approval failed",
            error: error.message
          });
        }
      case "complete":
        try {
          if (!data || !data.paymentId || !data.txid) {
            return res.status(400).json({
              message: "paymentId and txid are required for completion"
            });
          }
          const { paymentId, txid } = data;
          if (!isValidPaymentId(paymentId)) {
            return res.status(400).json({ message: "Invalid paymentId format" });
          }
          if (typeof txid !== "string" || txid.length === 0) {
            return res.status(400).json({ message: "Invalid txid format" });
          }
          console.log("Completing payment: " + paymentId + " with txid: " + txid);
          console.log("Payment completed: " + paymentId);
          return res.json({
            message: "Payment completed successfully",
            paymentId,
            txid
          });
        } catch (error) {
          console.error("\u274C Completion error:", error.stack || error);
          return res.status(500).json({
            message: "Payment completion failed",
            error: error.message
          });
        }
      default:
        return res.status(400).json({ message: `Invalid action: ${action}` });
    }
  } catch (error) {
    console.error("\u{1F525} Payment operation error:", error.stack || error);
    return res.status(500).json({
      message: "Payment operation failed",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
    });
  }
}
