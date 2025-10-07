import { getPricingService } from "./_utils";
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
    const pricingService = await getPricingService();
    const price = await pricingService.getCurrentPiPrice();
    const lastPrice = pricingService.getLastPrice();
    return response.status(200).json({
      price,
      lastUpdated: lastPrice?.lastUpdated || /* @__PURE__ */ new Date()
    });
  } catch (error) {
    console.error("Pi price fetch error:", error);
    return response.status(500).json({ message: "Failed to fetch Pi price" });
  }
}
export {
  handler as default
};
