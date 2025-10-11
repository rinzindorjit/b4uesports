interface PurchaseEmailParams {
    to: string;
    username: string;
    packageName: string;
    piAmount: string;
    usdAmount: string;
    gameAccount: string;
    transactionId: string;
    paymentId: string;
    isTestnet: boolean;
}
export declare function sendPurchaseConfirmationEmail(params: PurchaseEmailParams): Promise<boolean>;
export {};
//# sourceMappingURL=email.d.ts.map