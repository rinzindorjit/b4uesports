"use strict";
const { getStorage, getPiNetworkService, jwtSign, jwtVerify } = require("./_utils");
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
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  const { method } = req;
  const store = getStorage();
  const piService = getPiNetworkService();
  try {
    if (method === "POST") {
      const body = await readBody(req);
      if (body.action === "authenticate") {
        const { accessToken } = body.data;
        console.log("Attempting to verify access token:", accessToken ? "Token provided" : "No token");
        if (!accessToken) {
          return res.status(400).json({ message: "Missing access token" });
        }
        const userData = await piService.verifyAccessToken(accessToken);
        console.log("User data verified:", userData);
        if (!store.users[userData.pi_id]) {
          store.users[userData.pi_id] = userData;
        }
        const token = jwtSign({ pi_id: userData.pi_id });
        console.log("JWT token generated");
        return res.status(200).json({ message: "User authenticated", user: userData, token });
      }
      if (body.action === "getProfile") {
        const token = getToken(req);
        const decoded = jwtVerify(token);
        const user = store.users[decoded.pi_id];
        return res.status(200).json({ user });
      }
      return res.status(400).json({ message: "Invalid action for /api/users" });
    }
    if (method === "GET") {
      const token = getToken(req);
      const decoded = jwtVerify(token);
      const user = store.users[decoded.pi_id];
      return res.status(200).json({ user });
    }
    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({
      message: err.message || "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? {
        message: err.message,
        stack: err.stack,
        name: err.name
      } : void 0
    });
  }
};
