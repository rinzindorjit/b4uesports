import { getStorage, getPricingService } from "./_utils.js";
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
    const pricingService = await getPricingService();
    const packages = await storage.getActivePackages();
    const currentPiPrice = await pricingService.getCurrentPiPrice();
    const packagesWithPiPricing = packages.map((pkg) => ({
      ...pkg,
      piPrice: pricingService.calculatePiAmount(parseFloat(pkg.usdtValue)),
      currentPiPrice
    }));
    return response.status(200).json(packagesWithPiPricing);
  } catch (error) {
    console.error("Packages fetch error:", error);
    return response.status(500).json({ message: "Failed to fetch packages" });
  }
}
export {
  handler as default
};
