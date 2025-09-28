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

// We'll import supabase directly in each method to avoid TypeScript issues

// Mock data for development
const mockUsers: User[] = [];
const mockPackages: Package[] = [];
const mockTransactions: Transaction[] = [];
const mockAdmins: Admin[] = [];
const mockPriceHistory: PiPriceHistory[] = [];

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

// Mock storage implementation for development
export class MockStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    return mockUsers.find(user => user.id === id);
  }

  async getUserByPiUID(piUID: string): Promise<User | undefined> {
    return mockUsers.find(user => user.piUID === piUID);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = {
      ...user,
      id: `user_${mockUsers.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    mockUsers.push(newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    mockUsers[index] = {
      ...mockUsers[index],
      ...user,
      updatedAt: new Date(),
    };
    return mockUsers[index];
  }
  
  // Packages
  async getPackages(): Promise<Package[]> {
    return mockPackages;
  }

  async getActivePackages(): Promise<Package[]> {
    return mockPackages.filter(pkg => pkg.isActive);
  }

  async getPackage(id: string): Promise<Package | undefined> {
    return mockPackages.find(pkg => pkg.id === id);
  }

  async createPackage(pkg: InsertPackage): Promise<Package> {
    const newPackage = {
      ...pkg,
      id: `pkg_${mockPackages.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Package;
    mockPackages.push(newPackage);
    return newPackage;
  }

  async updatePackage(id: string, pkg: Partial<Package>): Promise<Package | undefined> {
    const index = mockPackages.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    mockPackages[index] = {
      ...mockPackages[index],
      ...pkg,
      updatedAt: new Date(),
    };
    return mockPackages[index];
  }
  
  // Transactions
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return mockTransactions.find(tx => tx.id === id);
  }

  async getTransactionByPaymentId(paymentId: string): Promise<Transaction | undefined> {
    return mockTransactions.find(tx => tx.paymentId === paymentId);
  }

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return mockTransactions.filter(tx => tx.userId === userId);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction = {
      ...transaction,
      id: `tx_${mockTransactions.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Transaction;
    mockTransactions.push(newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction | undefined> {
    const index = mockTransactions.findIndex(tx => tx.id === id);
    if (index === -1) return undefined;
    
    mockTransactions[index] = {
      ...mockTransactions[index],
      ...transaction,
      updatedAt: new Date(),
    };
    return mockTransactions[index];
  }

  async getAllTransactions(): Promise<(Transaction & { user: User; package: Package })[]> {
    return mockTransactions.map(tx => ({
      ...tx,
      user: mockUsers.find(u => u.id === tx.userId) || mockUsers[0],
      package: mockPackages.find(p => p.id === tx.packageId) || mockPackages[0],
    })) as (Transaction & { user: User; package: Package })[];
  }
  
  // Admins
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return mockAdmins.find(admin => admin.username === username);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const newAdmin = {
      ...admin,
      id: `admin_${mockAdmins.length + 1}`,
      createdAt: new Date(),
      lastLogin: null,
    } as Admin;
    mockAdmins.push(newAdmin);
    return newAdmin;
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    const admin = mockAdmins.find(a => a.id === id);
    if (admin) {
      admin.lastLogin = new Date();
    }
  }
  
  // Pi Price History
  async savePiPrice(price: number): Promise<PiPriceHistory> {
    const newPrice = {
      id: `price_${mockPriceHistory.length + 1}`,
      price: price.toString(),
      source: 'coingecko',
      timestamp: new Date(),
    } as PiPriceHistory;
    mockPriceHistory.push(newPrice);
    return newPrice;
  }

  async getLatestPiPrice(): Promise<PiPriceHistory | undefined> {
    if (mockPriceHistory.length === 0) return undefined;
    return mockPriceHistory[mockPriceHistory.length - 1];
  }
  
  // Analytics
  async getAnalytics(): Promise<{
    totalUsers: number;
    totalTransactions: number;
    totalRevenue: number;
    successRate: number;
  }> {
    const completedTransactions = mockTransactions.filter(tx => tx.status === 'completed');
    const totalRevenue = completedTransactions.reduce((sum, tx) => sum + parseFloat(tx.piAmount || '0'), 0);
    const successRate = mockTransactions.length > 0 
      ? (completedTransactions.length / mockTransactions.length) * 100 
      : 0;

    return {
      totalUsers: mockUsers.length,
      totalTransactions: mockTransactions.length,
      totalRevenue,
      successRate: Math.round(successRate * 100) / 100,
    };
  }
}

// Supabase storage implementation would go here in production

// Use mock storage in development, Supabase storage in production
export const storage = new MockStorage();