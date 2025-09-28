import { 
  users, 
  packages, 
  transactions, 
  admins, 
  piPriceHistory,
  type User, 
  type InsertUser,
  type Package,
  type InsertPackage,
  type Transaction,
  type InsertTransaction,
  type Admin,
  type InsertAdmin,
  type PiPriceHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sum, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByPiUID(piUID: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  
  // Packages
  getPackages(): Promise<Package[]>;
  getActivePackages(): Promise<Package[]>;
  getPackage(id: string): Promise<Package | undefined>;
  createPackage(pkg: InsertPackage): Promise<Package>;
  updatePackage(id: string, pkg: Partial<Package>): Promise<Package | undefined>;
  
  // Transactions
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionByPaymentId(paymentId: string): Promise<Transaction | undefined>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<(Transaction & { user: User; package: Package })[]>;
  
  // Admins
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdminLastLogin(id: string): Promise<void>;
  
  // Pi Price History
  savePiPrice(price: number): Promise<PiPriceHistory>;
  getLatestPiPrice(): Promise<PiPriceHistory | undefined>;
  
  // Analytics
  getAnalytics(): Promise<{
    totalUsers: number;
    totalTransactions: number;
    totalRevenue: number;
    successRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByPiUID(piUID: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.piUID, piUID));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values([insertUser]).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getPackages(): Promise<Package[]> {
    return await db.select().from(packages).orderBy(packages.game, packages.usdtValue);
  }

  async getActivePackages(): Promise<Package[]> {
    return await db
      .select()
      .from(packages)
      .where(eq(packages.isActive, true))
      .orderBy(packages.game, packages.usdtValue);
  }

  async getPackage(id: string): Promise<Package | undefined> {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
    return pkg || undefined;
  }

  async createPackage(insertPackage: InsertPackage): Promise<Package> {
    const [pkg] = await db.insert(packages).values([insertPackage]).returning();
    return pkg;
  }

  async updatePackage(id: string, packageData: Partial<Package>): Promise<Package | undefined> {
    const [pkg] = await db
      .update(packages)
      .set({ ...packageData, updatedAt: new Date() })
      .where(eq(packages.id, id))
      .returning();
    return pkg || undefined;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionByPaymentId(paymentId: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.paymentId, paymentId));
    return transaction || undefined;
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values([insertTransaction]).returning();
    return transaction;
  }

  async updateTransaction(id: string, transactionData: Partial<Transaction>): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ ...transactionData, updatedAt: new Date() })
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async getAllTransactions(): Promise<(Transaction & { user: User; package: Package })[]> {
    return await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        packageId: transactions.packageId,
        paymentId: transactions.paymentId,
        txid: transactions.txid,
        piAmount: transactions.piAmount,
        usdAmount: transactions.usdAmount,
        piPriceAtTime: transactions.piPriceAtTime,
        status: transactions.status,
        gameAccount: transactions.gameAccount,
        metadata: transactions.metadata,
        emailSent: transactions.emailSent,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,
        user: users,
        package: packages,
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(packages, eq(transactions.packageId, packages.id))
      .orderBy(desc(transactions.createdAt));
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values([insertAdmin]).returning();
    return admin;
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    await db
      .update(admins)
      .set({ lastLogin: new Date() })
      .where(eq(admins.id, id));
  }

  async savePiPrice(price: number): Promise<PiPriceHistory> {
    const [priceRecord] = await db
      .insert(piPriceHistory)
      .values([{ price: price.toString() }])
      .returning();
    return priceRecord;
  }

  async getLatestPiPrice(): Promise<PiPriceHistory | undefined> {
    const [priceRecord] = await db
      .select()
      .from(piPriceHistory)
      .orderBy(desc(piPriceHistory.timestamp))
      .limit(1);
    return priceRecord || undefined;
  }

  async getAnalytics(): Promise<{
    totalUsers: number;
    totalTransactions: number;
    totalRevenue: number;
    successRate: number;
  }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [transactionCount] = await db.select({ count: count() }).from(transactions);
    const [revenue] = await db
      .select({ total: sum(transactions.piAmount) })
      .from(transactions)
      .where(eq(transactions.status, "completed"));
    
    const [completedCount] = await db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.status, "completed"));

    const successRate = transactionCount.count > 0 
      ? (completedCount.count / transactionCount.count) * 100 
      : 0;

    return {
      totalUsers: userCount.count,
      totalTransactions: transactionCount.count,
      totalRevenue: parseFloat(revenue.total || "0"),
      successRate: Math.round(successRate * 100) / 100,
    };
  }
}

export const storage = new DatabaseStorage();
