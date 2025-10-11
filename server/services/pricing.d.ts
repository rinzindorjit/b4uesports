export interface PiPriceData {
    price: number;
    lastUpdated: Date;
}
export declare class PricingService {
    private lastPrice;
    private updateInterval;
    constructor();
    getCurrentPiPrice(): Promise<number>;
    calculatePiAmount(usdtValue: number): number;
    calculateUsdAmount(piAmount: number): number;
    startPriceUpdates(): void;
    stopPriceUpdates(): void;
    getLastPrice(): PiPriceData | null;
}
export declare const pricingService: PricingService;
//# sourceMappingURL=pricing.d.ts.map