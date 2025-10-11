export declare const piNetworkService: {
    isSandbox: boolean;
    verifyAccessToken: (accessToken: string, serverApiKey: string) => Promise<any>;
    approvePayment: (paymentId: string, apiKey: string) => Promise<boolean>;
    completePayment: (paymentId: string, txid: string, apiKey: string) => Promise<boolean>;
    getPayment: (paymentId: string, apiKey: string) => Promise<any>;
    cancelPayment: (paymentId: string, apiKey: string) => Promise<boolean>;
    createA2UPayment: (paymentData: any, apiKey: string) => Promise<any>;
};