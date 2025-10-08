import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
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
    const storageModule = await import("../server/storage");
    return storageModule.storage;
  } catch (error) {
    try {
      const storageModule = await import("../dist/server/storage");
      return storageModule.storage;
    } catch (fallbackError) {
      console.error("Failed to import storage module:", error);
      throw error;
    }
  }
}
async function getPricingService() {
  try {
    const pricingModule = await import("../server/services/pricing");
    return pricingModule.pricingService;
  } catch (error) {
    try {
      const pricingModule = await import("../dist/server/services/pricing");
      return pricingModule.pricingService;
    } catch (fallbackError) {
      console.error("Failed to import pricing service:", error);
      throw error;
    }
  }
}
async function getPiNetworkService() {
  try {
    const piNetworkModule = await import("../server/services/pi-network");
    return piNetworkModule.piNetworkService;
  } catch (error) {
    try {
      const piNetworkModule = await import("../dist/server/services/pi-network");
      return piNetworkModule.piNetworkService;
    } catch (fallbackError) {
      console.error("Failed to import Pi Network service:", error);
      throw error;
    }
  }
}
async function getEmailService() {
  try {
    const emailModule = await import("../server/services/email");
    return emailModule.sendPurchaseConfirmationEmail;
  } catch (error) {
    try {
      const emailModule = await import("../dist/server/services/email");
      return emailModule.sendPurchaseConfirmationEmail;
    } catch (fallbackError) {
      console.error("Failed to import email service:", error);
      throw error;
    }
  }
}
async function authenticateUser(request) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return { error: createResponse(401, { message: "No token provided" }) };
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
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
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await storage.getAdminByUsername(decoded.username);
    if (!admin || !admin.isActive) {
      return { error: createResponse(401, { message: "Invalid admin token" }) };
    }
    return { admin };
  } catch (error) {
    return { error: createResponse(401, { message: "Invalid token" }) };
  }
}
export {
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
};
