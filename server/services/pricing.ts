import axios from 'axios';
import { storage } from '../storage';

export interface PiPriceData {
  price: number;
  lastUpdated: Date;
}

export class PricingService {
  private lastPrice: PiPriceData | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPriceUpdates();
  }

  async getCurrentPiPrice(): Promise<number> {
    // Return fixed price as requested: $0.24069
    const fixedPrice = 0.24069;
    
    this.lastPrice = {
      price: fixedPrice,
      lastUpdated: new Date(),
    };

    // Save to database
    await storage.savePiPrice(fixedPrice);

    return fixedPrice;
  }

  calculatePiAmount(usdtValue: number): number {
    const piPrice = 0.24069; // Use fixed price
    return parseFloat((usdtValue / piPrice).toFixed(8));
  }

  calculateUsdAmount(piAmount: number): number {
    const piPrice = 0.24069; // Use fixed price
    return parseFloat((piAmount * piPrice).toFixed(4));
  }

  startPriceUpdates(): void {
    // Initial price fetch
    this.getCurrentPiPrice();

    // Update price every 60 seconds (but will still return fixed price)
    this.updateInterval = setInterval(async () => {
      try {
        await this.getCurrentPiPrice();
      } catch (error) {
        console.error('Error updating Pi price:', error);
      }
    }, 60000);
  }

  stopPriceUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  getLastPrice(): PiPriceData | null {
    return this.lastPrice;
  }
}

export const pricingService = new PricingService();

// Cleanup on process exit
process.on('SIGINT', () => {
  pricingService.stopPriceUpdates();
  process.exit(0);
});

process.on('SIGTERM', () => {
  pricingService.stopPriceUpdates();
  process.exit(0);
});