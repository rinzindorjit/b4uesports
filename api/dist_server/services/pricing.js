import { storage } from "../storage.js";
class PricingService {
  lastPrice = null;
  updateInterval = null;
  constructor() {
    this.startPriceUpdates();
  }
  async getCurrentPiPrice() {
    const fixedPrice = 0.24069;
    this.lastPrice = {
      price: fixedPrice,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    await storage.savePiPrice(fixedPrice);
    return fixedPrice;
  }
  calculatePiAmount(usdtValue) {
    const piPrice = 0.24069;
    return parseFloat((usdtValue / piPrice).toFixed(8));
  }
  calculateUsdAmount(piAmount) {
    const piPrice = 0.24069;
    return parseFloat((piAmount * piPrice).toFixed(4));
  }
  startPriceUpdates() {
    this.getCurrentPiPrice();
    this.updateInterval = setInterval(async () => {
      await this.getCurrentPiPrice();
    }, 6e4);
  }
  stopPriceUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  getLastPrice() {
    return this.lastPrice;
  }
}
const pricingService = new PricingService();
process.on("SIGINT", () => {
  pricingService.stopPriceUpdates();
  process.exit(0);
});
process.on("SIGTERM", () => {
  pricingService.stopPriceUpdates();
  process.exit(0);
});
export {
  PricingService,
  pricingService
};
