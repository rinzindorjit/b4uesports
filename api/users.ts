// @ts-nocheck
const { jwtVerify, jwtSign, getStorage, getPiNetworkService } = require("./_utils.js");

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { method } = req;
  
  if (method === "GET") {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwtVerify(token);
      const store = getStorage();
      const user = store.users[decoded.pi_id];
      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json({ user });
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  if (method === "POST") {
    const body = await readBody(req);
    const { action, accessToken } = body;

    if (action === "login") {
      if (!accessToken) return res.status(400).json({ message: "Access token required" });

      try {
        const piService = getPiNetworkService();
        const piUser = await piService.verifyAccessToken(accessToken);
        
        const store = getStorage();
        if (!store.users[piUser.pi_id]) {
          store.users[piUser.pi_id] = {
            ...piUser,
            id: piUser.pi_id,
            createdAt: new Date().toISOString(),
          };
        }

        const token = jwtSign(piUser);
        return res.status(200).json({ token, user: piUser });
      } catch (err) {
        console.error("Authentication failed:", err);
        return res.status(500).json({ 
          message: `Failed to verify Pi Network access token: ${err.message || 'Unknown error'}` 
        });
      }
    }

    return res.status(400).json({ message: "Invalid action for /api/users" });
  }

  return res.status(405).json({ message: "Method not allowed" });
}

module.exports = handler;