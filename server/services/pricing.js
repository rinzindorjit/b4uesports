import axios from 'axios';
import { storage } from '../storage';
export class PricingService {
    constructor() {
        this.lastPrice = null;
        this.updateInterval = null;
        this.startPriceUpdates();
    }
    async getCurrentPiPrice() {
        try {
            // Use CoinGecko API to get the current Pi price with demo key
            const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4', {
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
        }
        catch (error) {
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
    calculatePiAmount(usdtValue) {
        // Use the last fetched price or fallback to fixed price
        const piPrice = this.lastPrice?.price || 0.24069;
        return parseFloat((usdtValue / piPrice).toFixed(8));
    }
    calculateUsdAmount(piAmount) {
        // Use the last fetched price or fallback to fixed price
        const piPrice = this.lastPrice?.price || 0.24069;
        return parseFloat((piAmount * piPrice).toFixed(4));
    }
    startPriceUpdates() {
        // Initial price fetch
        this.getCurrentPiPrice();
        // Update price every 60 seconds
        this.updateInterval = setInterval(async () => {
            try {
                await this.getCurrentPiPrice();
            }
            catch (error) {
                console.error('Error updating Pi price:', error);
            }
        }, 60000);
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
