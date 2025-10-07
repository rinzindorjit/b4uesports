import { JWT_SECRET, getStorage, jwt } from "./_utils";
async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (request.method === "OPTIONS") {
    return response.status(200).end();
  }
  if (request.method !== "GET") {
    return response.status(405).json({ message: "Method not allowed" });
  }
  try {
    const storage = await getStorage();
    const authHeader = request.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return response.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const transactions = await storage.getUserTransactions(userId);
    return response.status(200).json(transactions);
  } catch (error) {
    console.error("Transactions fetch error:", error);
    return response.status(500).json({ message: "Failed to fetch transactions" });
  }
}
export {
  handler as default
};
