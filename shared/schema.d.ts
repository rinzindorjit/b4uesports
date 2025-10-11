export interface User {
    id: string;
    piUID: string;
    username: string;
    email: string;
    phone: string;
    country: string;
    language: string;
    walletAddress: string;
    profileImage?: string;
    gameAccounts?: {
        pubg?: {
            ign: string;
            uid: string;
        };
        mlbb?: {
            userId: string;
            zoneId: string;
        };
    };
    referralCode?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface InsertUser {
    piUID: string;
    username: string;
    email: string;
    phone: string;
    country: string;
    language: string;
    walletAddress: string;
    profileImage?: string;
    gameAccounts?: {
        pubg?: {
            ign: string;
            uid: string;
        };
        mlbb?: {
            userId: string;
            zoneId: string;
        };
    };
    referralCode?: string;
}
export interface Package {
    id: string;
    game: string;
    name: string;
    inGameAmount: number;
    usdtValue: string;
    image: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface InsertPackage {
    game: string;
    name: string;
    inGameAmount: number;
    usdtValue: string;
    image: string;
    isActive: boolean;
}
export interface Transaction {
    id: string;
    userId: string;
    packageId: string;
    paymentId: string;
    txid?: string;
    piAmount: string;
    usdAmount: string;
    piPriceAtTime: string;
    status: string;
    gameAccount: Record<string, string>;
    metadata?: Record<string, any>;
    emailSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface InsertTransaction {
    userId: string;
    packageId: string;
    paymentId: string;
    txid?: string;
    piAmount: string;
    usdAmount: string;
    piPriceAtTime: string;
    status: string;
    gameAccount: Record<string, string>;
    metadata?: Record<string, any>;
    emailSent: boolean;
}
export interface Admin {
    id: string;
    username: string;
    password: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    lastLogin: Date | null;
}
export interface InsertAdmin {
    username: string;
    password: string;
    email: string;
    role: string;
    isActive: boolean;
}
export interface PiPriceHistory {
    id: string;
    price: string;
    source: string;
    timestamp: Date;
}
//# sourceMappingURL=schema.d.ts.map