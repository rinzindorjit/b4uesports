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
    if (this.lastPrice && (Date.now() - this.lastPrice.lastUpdated.getTime()) < 60000) {
      return this.lastPrice.price;
    }

    try {
      // Use the provided CoinGecko API URL without API key
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4'
      );

      const price = response.data['pi-network']?.usd || 0.958; // fallback price
      
      this.lastPrice = {
        price,
        lastUpdated: new Date(),
      };

      // Save to database
      await storage.savePiPrice(price);

      return price;
    } catch (error) {
      console.error('Failed to fetch Pi price from CoinGecko:', error);
      
      // Try to get latest price from database
      const latestPrice = await storage.getLatestPiPrice();
      if (latestPrice) {
        return parseFloat(latestPrice.price);
      }

      // Fallback to default price
      return 0.958;
    }
  }

  calculatePiAmount(usdtValue: number): number {
    const piPrice = this.lastPrice?.price || 0.958;
    return parseFloat((usdtValue / piPrice).toFixed(8));
  }

  calculateUsdAmount(piAmount: number): number {
    const piPrice = this.lastPrice?.price || 0.958;
    return parseFloat((piAmount * piPrice).toFixed(4));
  }

  startPriceUpdates(): void {
    // Initial price fetch
    this.getCurrentPiPrice();

    // Update price every 60 seconds
    this.updateInterval = setInterval(async () => {
      await this.getCurrentPiPrice();
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