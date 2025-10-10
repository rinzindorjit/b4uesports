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
var utils_exports = {};
__export(utils_exports, {
  JWT_SECRET: () => JWT_SECRET,
  authenticateAdmin: () => authenticateAdmin,
  authenticateUser: () => authenticateUser,
  bcrypt: () => import_bcrypt.default,
  createResponse: () => createResponse,
  getEmailService: () => getEmailService,
  getPiNetworkService: () => getPiNetworkService,
  getPricingService: () => getPricingService,
  getStorage: () => getStorage,
  handleError: () => handleError,
  jwt: () => import_jsonwebtoken.default
});
module.exports = __toCommonJS(utils_exports);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_bcrypt = __toESM(require("bcrypt"));
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-secret";
function createResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
function handleError(error, message = "Internal Server Error") {
  console.error(message, error);
  return createResponse(500, { message });
}
async function getStorage() {
  try {
    const storageModule = await import("./dist_server/storage.js");
    return storageModule.storage;
  } catch (error) {
    console.error("Failed to import storage module:", error);
    throw error;
  }
}
async function getPricingService() {
  try {
    const pricingModule = await import("./dist_server/services/pricing.js");
    return pricingModule.pricingService;
  } catch (error) {
    console.error("Failed to import pricing service:", error);
    throw error;
  }
}
async function getPiNetworkService() {
  try {
    const piNetworkModule = await import("./dist_server/services/pi-network.js");
    return piNetworkModule.piNetworkService;
  } catch (error) {
    console.error("Failed to import Pi Network service:", error);
    throw error;
  }
}
async function getEmailService() {
  try {
    const emailModule = await import("./dist_server/services/email.js");
    return emailModule.sendPurchaseConfirmationEmail;
  } catch (error) {
    console.error("Failed to import email service:", error);
    throw error;
  }
}
async function authenticateUser(request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return { error: createResponse(401, { message: "No token provided" }) };
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    return { user: decoded };
  } catch (error) {
    return { error: createResponse(401, { message: "Invalid token" }) };
  }
}
async function authenticateAdmin(request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return { error: createResponse(401, { message: "No token provided" }) };
  }
  try {
    const storage = await getStorage();
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    const admin = await storage.getAdminByUsername(decoded.username);
    if (!admin || !admin.isActive) {
      return { error: createResponse(401, { message: "Invalid admin token" }) };
    }
    return { admin };
  } catch (error) {
    return { error: createResponse(401, { message: "Invalid token" }) };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  JWT_SECRET,
  authenticateAdmin,
  authenticateUser,
  bcrypt,
  createResponse,
  getEmailService,
  getPiNetworkService,
  getPricingService,
  getStorage,
  handleError,
  jwt
});
