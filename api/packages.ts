// @ts-nocheck
const { getStorage } = require("./index.js");

function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { method } = req;
  const store = getStorage();

  try {
    if (method === "GET") {
      // Return the packages array directly instead of wrapping it in an object
      return res.status(200).json(store.packages);
    }
    return res.status(405).json({ message: "Only GET allowed for /api/packages" });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
}

module.exports = handler;