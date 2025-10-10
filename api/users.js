import { readBody, getPiNetworkService, getStorage, jwtSign, jwtVerify } from "./utils";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const store = getStorage();

  if (req.method === "POST") {
    const { action, data } = await readBody(req);
    if (action === "authenticate") {
      if (!data?.accessToken) return res.status(400).json({ message: "Access token required" });
      try {
        const piUser = await getPiNetworkService().verifyAccessToken(data.accessToken);
        if (!store.users[piUser.pi_id]) store.users[piUser.pi_id] = { ...piUser, id: piUser.pi_id, createdAt: new Date().toISOString() };
        const token = jwtSign({ userId: piUser.pi_id, piUID: piUser.pi_id });
        return res.status(200).json({ user: store.users[piUser.pi_id], token });
      } catch (err) {
        return res.status(500).json({ message: `Authentication failed: ${err.message}` });
      }
    }
    return res.status(400).json({ message: "Invalid action" });
  }

  if (req.method === "GET") {
    const action = req.query.action;
    const token = req.headers.authorization?.split(" ")[1];
    if (action === "me") {
      if (!token) return res.status(401).json({ message: "No token provided" });
      try {
        const decoded = jwtVerify(token);
        const user = store.users[decoded.userId];
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json(user);
      } catch {
        return res.status(401).json({ message: "Invalid token" });
      }
    }
    return res.status(400).json({ message: "Invalid action" });
  }

  return res.status(405).json({ message: "Method not allowed" });
}