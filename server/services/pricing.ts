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
    try {
      // Use CoinGecko API to get the current Pi price
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'pi-network',
          vs_currencies: 'usd'
        },
        timeout: 5000 // 5 second timeout
      });
      
      const price = response.data['pi-network']?.usd;
      
      if (typeof price !== 'number') {
        throw new Error('Invalid price data received from CoinGecko');
      }
      
      this.lastPrice = {
        price: price,
        lastUpdated: new Date(),
      };

      // Save to database
      await storage.savePiPrice(price);

      return price;
    } catch (error) {
      console.error('Failed to fetch Pi price from CoinGecko:', error);
      
      // Fallback to fixed price if API fails
      const fixedPrice = 0.24069;
      this.lastPrice = {
        price: fixedPrice,
        lastUpdated: new Date(),
      };
      
      // Save to database
      await storage.savePiPrice(fixedPrice);
      
      return fixedPrice;
    }
  }

  calculatePiAmount(usdtValue: number): number {
    // Use the last fetched price or fallback to fixed price
    const piPrice = this.lastPrice?.price || 0.24069;
    return parseFloat((usdtValue / piPrice).toFixed(8));
  }

  calculateUsdAmount(piAmount: number): number {
    // Use the last fetched price or fallback to fixed price
    const piPrice = this.lastPrice?.price || 0.24069;
    return parseFloat((piAmount * piPrice).toFixed(4));
  }

  startPriceUpdates(): void {
    // Initial price fetch
    this.getCurrentPiPrice();

    // Update price every 60 seconds
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