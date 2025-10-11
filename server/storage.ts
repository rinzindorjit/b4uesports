import { 
  type User, 
  type InsertUser,
  type Package,
  type InsertPackage,
  type Transaction,
  type InsertTransaction,
  type Admin,
  type InsertAdmin,
  type PiPriceHistory
} from "../shared/schema";
import * as bcrypt from 'bcrypt';

// Mock data for development
const mockUsers: User[] = [];
const mockPackages: Package[] = [];
const mockTransactions: Transaction[] = [];
const mockAdmins: Admin[] = [];
const mockPriceHistory: PiPriceHistory[] = [];

// Initialize with default packages
function initializeMockPackages() {
  // Always reinitialize with new package data
  mockPackages.length = 0; // Clear existing packages
  
  // Package data
  const packages = [
    { id: "pubg-60", game: "PUBG", name: "60 UC", inGameAmount: 60, usdtValue: 1.5, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
    { id: "pubg-325", game: "PUBG", name: "325 UC", inGameAmount: 325, usdtValue: 6.5, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
    { id: "pubg-660", game: "PUBG", name: "660 UC", inGameAmount: 660, usdtValue: 12, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
    { id: "pubg-1800", game: "PUBG", name: "1800 UC", inGameAmount: 1800, usdtValue: 25, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
    { id: "pubg-3850", game: "PUBG", name: "3850 UC", inGameAmount: 3850, usdtValue: 49, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
    { id: "pubg-8100", game: "PUBG", name: "8100 UC", inGameAmount: 8100, usdtValue: 96, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
    { id: "pubg-16200", game: "PUBG", name: "16200 UC", inGameAmount: 16200, usdtValue: 186, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
    { id: "pubg-24300", game: "PUBG", name: "24300 UC", inGameAmount: 24300, usdtValue: 278, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
    { id: "pubg-32400", game: "PUBG", name: "32400 UC", inGameAmount: 32400, usdtValue: 369, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },
    { id: "pubg-40500", game: "PUBG", name: "40500 UC", inGameAmount: 40500, usdtValue: 459, image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png", isActive: true },

    { id: "mlbb-56", game: "MLBB", name: "56 Diamonds", inGameAmount: 56, usdtValue: 3, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true },
    { id: "mlbb-278", game: "MLBB", name: "278 Diamonds", inGameAmount: 278, usdtValue: 6, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true },
    { id: "mlbb-571", game: "MLBB", name: "571 Diamonds", inGameAmount: 571, usdtValue: 11, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true },
    { id: "mlbb-1783", game: "MLBB", name: "1783 Diamonds", inGameAmount: 1783, usdtValue: 33, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true },
    { id: "mlbb-3005", game: "MLBB", name: "3005 Diamonds", inGameAmount: 3005, usdtValue: 52, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true },
    { id: "mlbb-6012", game: "MLBB", name: "6012 Diamonds", inGameAmount: 6012, usdtValue: 99, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true },
    { id: "mlbb-12000", game: "MLBB", name: "12000 Diamonds", inGameAmount: 12000, usdtValue: 200, image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png", isActive: true }
  ];
  
  // Add all packages to mock storage
  packages.forEach((pkg) => {
    const usdtValue = pkg.usdtValue.toFixed(4);
    
    mockPackages.push({
      ...pkg,
      usdtValue: usdtValue,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
}

// Initialize mock packages on module load
initializeMockPackages();

// Initialize default admin user
function initializeMockAdmin() {
  if (mockAdmins.length === 0) {
    // Create a default admin user with username 'admin' and password 'admin123'
    // For mock data, we'll use a pre-hashed password for 'admin123'
    // Hashed value of 'admin123' with bcrypt cost factor 10
    const hashedPassword = '$2b$10$nl1.TXf.KMXSeDczktt9yerr1XjYgJWzKGnsP8fL7Vsqrzs2im4Hi'; // bcrypt hash of 'admin123'
    
    mockAdmins.push({
      id: 'admin_1',
      username: 'admin',
      password: hashedPassword,
      email: 'admin@b4uesports.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      lastLogin: null,
    });
    
    console.log('Default admin user created:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Please change this password after first login for security.');
  }
}

// Initialize mock admin on module load
initializeMockAdmin();

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