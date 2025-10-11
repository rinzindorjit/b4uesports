import { type User, type InsertUser, type Package, type InsertPackage, type Transaction, type InsertTransaction, type Admin, type InsertAdmin, type PiPriceHistory } from "../shared/schema";
export interface IStorage {
    getUser(id: string): Promise<User | undefined>;
    getUserByPiUID(piUID: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
    getPackages(): Promise<Package[]>;
    getActivePackages(): Promise<Package[]>;
    getPackage(id: string): Promise<Package | undefined>;
    createPackage(pkg: InsertPackage): Promise<Package>;
    updatePackage(id: string, pkg: Partial<Package>): Promise<Package | undefined>;
    getTransaction(id: string): Promise<Transaction | undefined>;
    getTransactionByPaymentId(paymentId: string): Promise<Transaction | undefined>;
    getUserTransactions(userId: string): Promise<Transaction[]>;
    createTransaction(transaction: InsertTransaction): Promise<Transaction>;
    updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
    getAllTransactions(): Promise<(Transaction & {
        user: User;
        package: Package;
    })[]>;
    getAdminByUsername(username: string): Promise<Admin | undefined>;
    createAdmin(admin: InsertAdmin): Promise<Admin>;
    updateAdminLastLogin(id: string): Promise<void>;
    savePiPrice(price: number): Promise<PiPriceHistory>;
    getLatestPiPrice(): Promise<PiPriceHistory | undefined>;
    getAnalytics(): Promise<{
        totalUsers: number;
        totalTransactions: number;
        totalRevenue: number;
        successRate: number;
    }>;
}
export declare class MockStorage implements IStorage {
    getUser(id: string): Promise<User | undefined>;
    getUserByPiUID(piUID: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
    getPackages(): Promise<Package[]>;
    getActivePackages(): Promise<Package[]>;
    getPackage(id: string): Promise<Package | undefined>;
    createPackage(pkg: InsertPackage): Promise<Package>;
    updatePackage(id: string, pkg: Partial<Package>): Promise<Package | undefined>;
    getTransaction(id: string): Promise<Transaction | undefined>;
    getTransactionByPaymentId(paymentId: string): Promise<Transaction | undefined>;
    getUserTransactions(userId: string): Promise<Transaction[]>;
    createTransaction(transaction: InsertTransaction): Promise<Transaction>;
    updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
    getAllTransactions(): Promise<(Transaction & {
        user: User;
        package: Package;
    })[]>;
    getAdminByUsername(username: string): Promise<Admin | undefined>;
    createAdmin(admin: InsertAdmin): Promise<Admin>;
    updateAdminLastLogin(id: string): Promise<void>;
    savePiPrice(price: number): Promise<PiPriceHistory>;
    getLatestPiPrice(): Promise<PiPriceHistory | undefined>;
    getAnalytics(): Promise<{
        totalUsers: number;
        totalTransactions: number;
        totalRevenue: number;
        successRate: number;
    }>;
}
export declare const storage: MockStorage;
//# sourceMappingURL=storage.d.ts.map