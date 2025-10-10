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
var test_exports = {};
__export(test_exports, {
  default: () => handler
});
module.exports = __toCommonJS(test_exports);
async function handler(request, response) {
  const allowedOrigin = process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL || "https://yourdomain.com" : "*";
  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Max-Age", "86400");
  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }
  if (process.env.NODE_ENV === "production" && request.method !== "GET") {
    return response.status(405).json({ message: "Method not allowed. Only GET requests are allowed in production." });
  }
  return response.json({
    message: "API test endpoint",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    method: request.method,
    url: request.url,
    environment: process.env.NODE_ENV || "development"
  });
}
