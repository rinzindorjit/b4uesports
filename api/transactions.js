import { readBody, getStorage, jwtVerify } from "./utils";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  const store = getStorage();
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwtVerify(token);
    const userId = decoded.userId;
    if (req.method === "GET") {
      return res.status(200).json(store.transactions.filter(txn => txn.user === userId));
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      const txn = { id: `txn_${Date.now()}`, user: userId, amount: body.amount, date: new Date() };
      store.transactions.push(txn);
      return res.status(200).json({ message: "Transaction added", txn });
    }
    return res.status(405).json({ message: "Method not allowed" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}