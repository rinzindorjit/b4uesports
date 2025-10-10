import { getStorage } from "./utils";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    try {
      const store = getStorage();
      const packages = store.packages.filter(pkg => pkg.isActive);
      
      // Return direct array of package objects as expected by frontend
      return res.status(200).json(packages);
    } catch (error) {
      console.error("Packages fetch error:", error);
      return res.status(500).json({ message: "Failed to fetch packages" });
    }
  }

  return res.status(405).json({ message: "Only GET allowed" });
}