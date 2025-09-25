var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import multer from "multer";
import path3 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { dirname as dirname2 } from "path";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  admins: () => admins,
  insertAdminSchema: () => insertAdminSchema,
  insertPackageSchema: () => insertPackageSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  packages: () => packages,
  packagesRelations: () => packagesRelations,
  piPriceHistory: () => piPriceHistory,
  transactions: () => transactions,
  transactionsRelations: () => transactionsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  piUID: text("pi_uid").notNull().unique(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull().default("Bhutan"),
  language: text("language").notNull().default("en"),
  walletAddress: text("wallet_address").notNull(),
  profileImageUrl: text("profile_image_url"),
  gameAccounts: jsonb("game_accounts").$type(),
  referralCode: text("referral_code"),
  passphrase: text("passphrase"),
  // hashed passphrase for payment confirmation
  isProfileVerified: boolean("is_profile_verified").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  // Add balance field for tracking user Pi balance
  balance: decimal("balance", { precision: 18, scale: 8 }).notNull().default("1000.00000000"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var packages = pgTable("packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  game: text("game").notNull(),
  // "PUBG" or "MLBB"
  name: text("name").notNull(),
  // e.g., "660 UC", "571 Diamonds"
  inGameAmount: integer("in_game_amount").notNull(),
  usdtValue: decimal("usdt_value", { precision: 10, scale: 4 }).notNull(),
  image: text("image").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  packageId: varchar("package_id").notNull().references(() => packages.id),
  paymentId: text("payment_id").notNull().unique(),
  // Pi Network payment ID
  txid: text("txid"),
  // blockchain transaction ID
  piAmount: decimal("pi_amount", { precision: 18, scale: 8 }).notNull(),
  usdAmount: decimal("usd_amount", { precision: 10, scale: 4 }).notNull(),
  piPriceAtTime: decimal("pi_price_at_time", { precision: 10, scale: 4 }).notNull(),
  status: text("status").notNull().default("pending"),
  // pending, approved, completed, failed, cancelled
  gameAccount: jsonb("game_account").$type().notNull(),
  metadata: jsonb("metadata").$type(),
  emailSent: boolean("email_sent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  // hashed password
  email: text("email").notNull(),
  role: text("role").notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow()
});
var piPriceHistory = pgTable("pi_price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
  source: text("source").notNull().default("coingecko"),
  timestamp: timestamp("timestamp").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions)
}));
var packagesRelations = relations(packages, ({ many }) => ({
  transactions: many(transactions)
}));
var transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id]
  }),
  package: one(packages, {
    fields: [transactions.packageId],
    references: [packages.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
  lastLogin: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
var isPreview = process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development";
if (!process.env.DATABASE_URL && !isPreview) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
function getDatabase() {
  if (isPreview) {
    console.log("Using mock database for preview mode");
    const mockData = {
      users: [],
      packages: [],
      transactions: [],
      admins: [],
      piPriceHistory: []
    };
    return {
      select: () => ({
        from: (table) => {
          const tableName = Object.keys(schema_exports).find((key) => schema_exports[key] === table);
          return {
            where: () => Promise.resolve(mockData[tableName] || []),
            orderBy: () => Promise.resolve(mockData[tableName] || [])
          };
        }
      }),
      insert: (table) => {
        const tableName = Object.keys(schema_exports).find((key) => schema_exports[key] === table);
        return {
          values: (values) => {
            const newValues = Array.isArray(values) ? values : [values];
            if (mockData[tableName]) {
              mockData[tableName].push(...newValues.map((val, index) => ({
                ...val,
                id: val.id || `mock-${tableName}-${Date.now()}-${index}`,
                createdAt: val.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
                updatedAt: val.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
              })));
            }
            return {
              returning: () => Promise.resolve(newValues.map((val, index) => ({
                ...val,
                id: val.id || `mock-${tableName}-${Date.now()}-${index}`,
                createdAt: val.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
                updatedAt: val.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
              })))
            };
          }
        };
      },
      update: (table) => {
        const tableName = Object.keys(schema_exports).find((key) => schema_exports[key] === table);
        return {
          set: (updateData) => ({
            where: () => {
              if (mockData[tableName] && mockData[tableName].length > 0) {
                mockData[tableName][0] = {
                  ...mockData[tableName][0],
                  ...updateData,
                  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
                };
              }
              return {
                returning: () => Promise.resolve([mockData[tableName][0]].filter(Boolean))
              };
            }
          })
        };
      },
      delete: () => ({
        where: () => Promise.resolve([])
      })
    };
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle({ client: pool, schema: schema_exports });
}
var db = getDatabase();

// server/storage.ts
import { eq, desc, count, sum } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByPiUID(piUID) {
    const [user] = await db.select().from(users).where(eq(users.piUID, piUID));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values([insertUser]).returning();
    return user;
  }
  async updateUser(id, userData) {
    const [user] = await db.update(users).set({ ...userData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  async updateUserBalance(id, amount, operation) {
    try {
      const currentUser = await this.getUser(id);
      if (!currentUser) {
        throw new Error("User not found");
      }
      const currentBalance = parseFloat(currentUser.balance || "0");
      const newBalance = operation === "add" ? currentBalance + amount : currentBalance - amount;
      const [user] = await db.update(users).set({
        balance: newBalance.toString(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(users.id, id)).returning();
      return user || void 0;
    } catch (error) {
      console.error("Error updating user balance:", error);
      return void 0;
    }
  }
  async getPackages() {
    return await db.select().from(packages).orderBy(packages.game, packages.usdtValue);
  }
  async getActivePackages() {
    return await db.select().from(packages).where(eq(packages.isActive, true)).orderBy(packages.game, packages.usdtValue);
  }
  async getPackage(id) {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
    return pkg || void 0;
  }
  async createPackage(insertPackage) {
    const [pkg] = await db.insert(packages).values([insertPackage]).returning();
    return pkg;
  }
  async updatePackage(id, packageData) {
    const [pkg] = await db.update(packages).set({ ...packageData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(packages.id, id)).returning();
    return pkg || void 0;
  }
  async getTransaction(id) {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || void 0;
  }
  async getTransactionByPaymentId(paymentId) {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.paymentId, paymentId));
    return transaction || void 0;
  }
  async getUserTransactions(userId) {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }
  async createTransaction(insertTransaction) {
    const [transaction] = await db.insert(transactions).values([insertTransaction]).returning();
    return transaction;
  }
  async updateTransaction(id, transactionData) {
    const [transaction] = await db.update(transactions).set({ ...transactionData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(transactions.id, id)).returning();
    return transaction || void 0;
  }
  async getAllTransactions() {
    return await db.select({
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
      package: packages
    }).from(transactions).leftJoin(users, eq(transactions.userId, users.id)).leftJoin(packages, eq(transactions.packageId, packages.id)).orderBy(desc(transactions.createdAt));
  }
  async getAdminByUsername(username) {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || void 0;
  }
  async createAdmin(insertAdmin) {
    const [admin] = await db.insert(admins).values([insertAdmin]).returning();
    return admin;
  }
  async updateAdminLastLogin(id) {
    await db.update(admins).set({ lastLogin: /* @__PURE__ */ new Date() }).where(eq(admins.id, id));
  }
  async savePiPrice(price) {
    const [priceRecord] = await db.insert(piPriceHistory).values([{ price: price.toString() }]).returning();
    return priceRecord;
  }
  async getLatestPiPrice() {
    try {
      const priceRecords = await db.select().from(piPriceHistory).orderBy(desc(piPriceHistory.timestamp)).limit(1);
      return priceRecords[0] || void 0;
    } catch (error) {
      console.log("Using fallback approach for getLatestPiPrice");
      const allRecords = await db.select().from(piPriceHistory);
      if (allRecords && allRecords.length > 0) {
        allRecords.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        return allRecords[0];
      }
      return void 0;
    }
  }
  async getAnalytics() {
    try {
      const [userCount] = await db.select({ count: count() }).from(users);
      const [transactionCount] = await db.select({ count: count() }).from(transactions);
      const [revenue] = await db.select({ total: sum(transactions.piAmount) }).from(transactions).where(eq(transactions.status, "completed"));
      const [completedCount] = await db.select({ count: count() }).from(transactions).where(eq(transactions.status, "completed"));
      const successRate = transactionCount.count > 0 ? completedCount.count / transactionCount.count * 100 : 0;
      return {
        totalUsers: userCount.count,
        totalTransactions: transactionCount.count,
        totalRevenue: parseFloat(revenue.total || "0"),
        successRate: Math.round(successRate * 100) / 100
      };
    } catch (error) {
      console.log("Using fallback approach for getAnalytics");
      return {
        totalUsers: 0,
        totalTransactions: 0,
        totalRevenue: 0,
        successRate: 0
      };
    }
  }
};
var storage = new DatabaseStorage();

// server/services/pi-network.ts
import axios from "axios";
var PI_API_BASE = "https://api.minepi.com";
var SERVER_API_KEY = process.env.PI_SERVER_API_KEY;
var IS_SANDBOX = true;
if (IS_SANDBOX) {
  console.log("Running in sandbox mode - no API keys required");
} else if (!SERVER_API_KEY) {
  console.warn("PI_SERVER_API_KEY environment variable not set - using mock mode");
}
var PiNetworkService = class {
  apiKey;
  isMockMode;
  constructor() {
    this.apiKey = SERVER_API_KEY || null;
    this.isMockMode = IS_SANDBOX || !SERVER_API_KEY;
    if (this.isMockMode) {
      console.log("PiNetworkService running in mock mode - no real API calls will be made");
      if (IS_SANDBOX) {
        console.log("Sandbox mode: No API keys required for Pi Network operations");
      }
    }
  }
  async verifyAccessToken(accessToken) {
    if (this.isMockMode) {
      return {
        uid: "mock-user-uid",
        username: "mock_user",
        roles: ["user"]
      };
    }
    try {
      const response = await axios.get(`${PI_API_BASE}/v2/me`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Pi Network token verification failed:", error);
      return null;
    }
  }
  async approvePayment(paymentId) {
    if (this.isMockMode) {
      console.log("Mock payment approval for:", paymentId);
      const globalAny = global;
      if (globalAny.mockTransactions) {
        const transaction = globalAny.mockTransactions.find((tx) => tx.paymentId === paymentId);
        if (transaction) {
          transaction.status = "approved";
          transaction.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        }
      }
      return true;
    }
    try {
      await axios.post(
        `${PI_API_BASE}/v2/payments/${paymentId}/approve`,
        {},
        {
          headers: {
            "Authorization": `Key ${this.apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );
      return true;
    } catch (error) {
      console.error("Payment approval failed:", error);
      return false;
    }
  }
  async completePayment(paymentId, txid) {
    if (this.isMockMode) {
      console.log("Mock payment completion for:", paymentId, "with txid:", txid);
      const globalAny = global;
      if (globalAny.mockTransactions) {
        const transaction = globalAny.mockTransactions.find((tx) => tx.paymentId === paymentId);
        if (transaction) {
          transaction.status = "completed";
          transaction.txid = txid;
          transaction.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        }
      }
      return true;
    }
    try {
      await axios.post(
        `${PI_API_BASE}/v2/payments/${paymentId}/complete`,
        { txid },
        {
          headers: {
            "Authorization": `Key ${this.apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );
      return true;
    } catch (error) {
      console.error("Payment completion failed:", error);
      return false;
    }
  }
  async getPayment(paymentId) {
    if (this.isMockMode) {
      console.log("Mock payment retrieval for:", paymentId);
      return {
        identifier: paymentId,
        user_uid: "mock-user-uid",
        amount: 1,
        memo: "Mock payment",
        metadata: {},
        from_address: "mock-from-address",
        to_address: "mock-to-address",
        direction: "user_to_app",
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        network: "Pi Testnet",
        status: {
          developer_approved: true,
          transaction_verified: true,
          developer_completed: false,
          cancelled: false,
          user_cancelled: false
        },
        transaction: null
      };
    }
    try {
      const response = await axios.get(`${PI_API_BASE}/v2/payments/${paymentId}`, {
        headers: {
          "Authorization": `Key ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Get payment failed:", error);
      return null;
    }
  }
  async cancelPayment(paymentId) {
    if (this.isMockMode) {
      console.log("Mock payment cancellation for:", paymentId);
      return true;
    }
    try {
      await axios.post(
        `${PI_API_BASE}/v2/payments/${paymentId}/cancel`,
        {},
        {
          headers: {
            "Authorization": `Key ${this.apiKey}`,
            "Content-Type": "application/json"
          }
        }
      );
      return true;
    } catch (error) {
      console.error("Payment cancellation failed:", error);
      return false;
    }
  }
};
var piNetworkService = new PiNetworkService();

// server/services/pricing.ts
import axios2 from "axios";
var COINGECKO_API_KEY = process.env.COINGECKO_API_KEY || "CG-z4MZkBd78fn7PgPhPYcKq1r4";
var PricingService = class {
  lastPrice = null;
  updateInterval = null;
  constructor() {
    this.startPriceUpdates();
  }
  async getCurrentPiPrice() {
    if (this.lastPrice && Date.now() - this.lastPrice.lastUpdated.getTime() < 6e4) {
      return this.lastPrice.price;
    }
    try {
      const response = await axios2.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=${COINGECKO_API_KEY}`
      );
      const price = response.data["pi-network"]?.usd || 0.01;
      this.lastPrice = {
        price,
        lastUpdated: /* @__PURE__ */ new Date()
      };
      await storage.savePiPrice(price);
      return price;
    } catch (error) {
      console.error("Failed to fetch Pi price from CoinGecko:", error);
      const latestPrice = await storage.getLatestPiPrice();
      if (latestPrice) {
        return parseFloat(latestPrice.price);
      }
      return 0.01;
    }
  }
  calculatePiAmount(usdtValue) {
    const piPrice = this.lastPrice?.price || 0.958;
    return parseFloat((usdtValue / piPrice).toFixed(8));
  }
  calculateUsdAmount(piAmount) {
    const piPrice = this.lastPrice?.price || 0.958;
    return parseFloat((piAmount * piPrice).toFixed(4));
  }
  startPriceUpdates() {
    this.getCurrentPiPrice();
    this.updateInterval = setInterval(async () => {
      await this.getCurrentPiPrice();
    }, 6e4);
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
};
var pricingService = new PricingService();
process.on("SIGINT", () => {
  pricingService.stopPriceUpdates();
  process.exit(0);
});
process.on("SIGTERM", () => {
  pricingService.stopPriceUpdates();
  process.exit(0);
});

// server/services/email.ts
import emailjs from "emailjs-com";
var EMAILJS_CONFIG = {
  SERVICE_ID: process.env.EMAILJS_SERVICE_ID || "",
  TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID || "",
  ADMIN_TEMPLATE_ID: process.env.EMAILJS_ADMIN_TEMPLATE_ID || "",
  PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || "",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@b4uesports.com"
};
var isEmailJSConfigured = EMAILJS_CONFIG.SERVICE_ID && EMAILJS_CONFIG.TEMPLATE_ID && EMAILJS_CONFIG.PUBLIC_KEY;
if (!isEmailJSConfigured) {
  console.warn("EmailJS environment variables not set - email notifications will be disabled");
}
async function sendPurchaseConfirmationEmail(params) {
  if (!isEmailJSConfigured) {
    console.log("Email notification skipped - EmailJS not configured");
    return false;
  }
  const testnetWarning = params.isTestnet ? `\u{1F6A7} TESTNET TRANSACTION - No real Pi coins were deducted from your mainnet wallet.` : "";
  try {
    const userTemplateParams = {
      to_email: params.to,
      username: params.username,
      package_name: params.packageName,
      pi_amount: params.piAmount,
      usd_amount: params.usdAmount,
      game_account: params.gameAccount,
      transaction_id: params.transactionId,
      payment_id: params.paymentId,
      testnet_warning: testnetWarning,
      is_testnet: params.isTestnet ? "YES" : "NO"
    };
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      userTemplateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    const adminTemplateParams = {
      to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
      username: params.username,
      package_name: params.packageName,
      pi_amount: params.piAmount,
      usd_amount: params.usdAmount,
      game_account: params.gameAccount,
      transaction_id: params.transactionId,
      payment_id: params.paymentId,
      user_email: params.to,
      testnet_warning: testnetWarning,
      is_testnet: params.isTestnet ? "YES" : "NO"
    };
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.ADMIN_TEMPLATE_ID,
      adminTemplateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    return true;
  } catch (error) {
    console.error("EmailJS email error:", error);
    return false;
  }
}

// server/routes.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "fallback-secret";
async function registerRoutes(app2) {
  app2.get("/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime()
    });
  });
  const authenticateAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const admin = await storage.getAdminByUsername(decoded.username);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: "Invalid admin token" });
      }
      req.admin = admin;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
  app2.post("/api/auth/pi", async (req, res) => {
    try {
      if (req.body.isMockAuth) {
        console.log("Using mock authentication for Pi Browser development");
        const mockUser = {
          id: "mock-user-" + Date.now(),
          piUID: "mock-pi-uid-" + Date.now(),
          username: "pi_user_" + Math.floor(Math.random() * 1e4),
          email: "piuser@example.com",
          phone: "+1234567890",
          country: "US",
          language: "en",
          walletAddress: "GAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          gameAccounts: {
            pubg: { ign: "PiPlayer", uid: "PID123456789" },
            mlbb: { userId: "MLBB987654321", zoneId: "ZONE1234" }
          },
          profileImageUrl: null,
          isProfileVerified: true,
          isActive: true,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const mockToken = "mock-jwt-token-" + Date.now();
        console.log("Mock authentication successful for user:", mockUser.username);
        await new Promise((resolve) => setTimeout(resolve, 300));
        return res.status(200).json({
          user: mockUser,
          token: mockToken
        });
      }
      const { accessToken } = req.body;
      if (!accessToken) {
        return res.status(400).json({ message: "Access token required" });
      }
      const piUser = await piNetworkService.verifyAccessToken(accessToken);
      if (!piUser) {
        return res.status(401).json({ message: "Invalid Pi Network token" });
      }
      let user = await storage.getUserByPiUID(piUser.uid);
      if (!user) {
        const newUser = {
          piUID: piUser.uid,
          username: piUser.username,
          email: "",
          phone: "",
          country: "Bhutan",
          language: "en",
          walletAddress: "",
          // Will be updated when they make their first transaction
          isProfileVerified: false
          // Profile not verified yet
        };
        user = await storage.createUser(newUser);
      } else {
      }
      const token = jwt.sign({ userId: user.id, piUID: user.piUID }, JWT_SECRET, { expiresIn: "7d" });
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          country: user.country,
          language: user.language,
          gameAccounts: user.gameAccounts,
          walletAddress: user.walletAddress,
          profileImageUrl: user.profileImageUrl
        },
        token
      });
    } catch (error) {
      console.error("Pi authentication error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      const admin = await storage.getAdminByUsername(username);
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      await storage.updateAdminLastLogin(admin.id);
      const token = jwt.sign({ adminId: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: "8h" });
      res.json({
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role
        },
        token
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/pi-price", async (req, res) => {
    try {
      const price = await pricingService.getCurrentPiPrice();
      const lastPrice = pricingService.getLastPrice();
      res.json({
        price,
        lastUpdated: lastPrice?.lastUpdated || /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Pi price fetch error:", error);
      res.status(500).json({ message: "Failed to fetch Pi price" });
    }
  });
  app2.get("/api/pi-balance", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const balance = {
        balance: parseFloat(user.balance || "1000.00000000"),
        // Default to 1000 Pi if no balance set
        currency: "\u03C0",
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        isTestnet: true
      };
      res.json(balance);
    } catch (error) {
      console.error("Pi balance fetch error:", error);
      res.status(500).json({ message: "Failed to fetch Pi balance" });
    }
  });
  app2.post("/api/mock-pi-payment", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
      const { packageId, gameAccount } = req.body;
      if (!packageId) {
        return res.status(400).json({ message: "Package ID required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const pkg = await storage.getPackage(packageId);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      const userBalance = parseFloat(user.balance || "1000.00000000");
      const packagePrice = parseFloat(pkg.usdtValue);
      const currentPiPrice = await pricingService.getCurrentPiPrice();
      const piAmount = pricingService.calculatePiAmount(packagePrice);
      if (userBalance < piAmount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      const updatedUser = await storage.updateUserBalance(userId, piAmount, "subtract");
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user balance" });
      }
      const mockPaymentId = "MOCK-" + Date.now();
      const mockTxId = "MOCK-TX-" + Date.now();
      const transactionData = {
        userId,
        packageId,
        paymentId: mockPaymentId,
        txid: mockTxId,
        piAmount: piAmount.toString(),
        usdAmount: packagePrice.toString(),
        piPriceAtTime: currentPiPrice.toString(),
        status: "completed",
        gameAccount: gameAccount || {},
        metadata: {
          type: "mock-payment",
          mock: true
        },
        emailSent: false
      };
      const transaction = await storage.createTransaction(transactionData);
      try {
        if (user.email) {
          const gameAccountString = gameAccount?.ign ? `${gameAccount.ign} (${gameAccount.uid})` : `${gameAccount?.userId}:${gameAccount?.zoneId}`;
          const emailSent = await sendPurchaseConfirmationEmail({
            to: user.email,
            username: user.username,
            packageName: pkg.name,
            piAmount: piAmount.toString(),
            usdAmount: packagePrice.toString(),
            gameAccount: gameAccountString,
            transactionId: transaction.id,
            paymentId: mockPaymentId,
            isTestnet: true
          });
          await storage.updateTransaction(transaction.id, { emailSent });
        }
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
      res.json({
        success: true,
        message: "Mock payment processed successfully",
        transactionId: transaction.id,
        newBalance: parseFloat(updatedUser.balance || "0")
      });
    } catch (error) {
      console.error("Mock payment error:", error);
      res.status(500).json({ message: "Mock payment failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/packages", async (req, res) => {
    try {
      const packages2 = await storage.getActivePackages();
      const currentPiPrice = await pricingService.getCurrentPiPrice();
      const packagesWithPiPricing = packages2.map((pkg) => ({
        ...pkg,
        piPrice: pricingService.calculatePiAmount(parseFloat(pkg.usdtValue)),
        currentPiPrice
      }));
      res.json(packagesWithPiPricing);
    } catch (error) {
      console.error("Packages fetch error:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });
  app2.put("/api/profile", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
      let updateData = {};
      if (req.headers["content-type"]?.includes("multipart/form-data")) {
        updateData = {};
        Object.keys(req.body).forEach((key) => {
          try {
            updateData[key] = JSON.parse(req.body[key]);
          } catch (e) {
            updateData[key] = req.body[key];
          }
        });
        if (req.files && req.files.length > 0) {
          const file = req.files[0];
          updateData.profileImageUrl = `/uploads/profile-${userId}-${Date.now()}.${file.originalname.split(".").pop()}`;
          const fs2 = __require("fs");
          const path4 = __require("path");
          const uploadPath = path4.join(__dirname, "../uploads", `profile-${userId}-${Date.now()}.${file.originalname.split(".").pop()}`);
          const uploadsDir = path4.join(__dirname, "../uploads");
          if (!fs2.existsSync(uploadsDir)) {
            fs2.mkdirSync(uploadsDir, { recursive: true });
          }
          if (fs2.existsSync(file.path)) {
            fs2.renameSync(file.path, uploadPath);
          } else {
            fs2.writeFileSync(uploadPath, "");
          }
        }
      } else {
        updateData = req.body;
      }
      if (updateData.email && !updateData.email.endsWith("@gmail.com")) {
        return res.status(400).json({ message: "Email must be a Gmail address" });
      }
      if (updateData.email && updateData.phone && updateData.isProfileVerified !== false) {
        updateData.isProfileVerified = true;
      }
      let updatedUser;
      try {
        updatedUser = await storage.updateUser(userId, updateData);
      } catch (dbError) {
        console.error("Database error during profile update:", dbError);
        return res.json({
          id: userId,
          ...updateData,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Profile update error:", error);
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message || "Profile update failed" });
      }
      return res.status(500).json({ message: "Profile update failed: " + error.message });
    }
  });
  app2.post("/api/payment/approve", async (req, res) => {
    try {
      const { paymentId } = req.body;
      if (!paymentId) {
        return res.status(400).json({ message: "Payment ID required" });
      }
      const payment = await piNetworkService.getPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      if (!payment.metadata?.type || payment.metadata.type !== "backend") {
        return res.status(400).json({ message: "Invalid payment metadata" });
      }
      let transaction = await storage.getTransactionByPaymentId(paymentId);
      if (!transaction) {
        const currentPiPrice = await pricingService.getCurrentPiPrice();
        const usdAmount = pricingService.calculateUsdAmount(payment.amount);
        const transactionData = {
          userId: payment.metadata.userId,
          packageId: payment.metadata.packageId,
          paymentId: payment.identifier,
          piAmount: payment.amount.toString(),
          usdAmount: usdAmount.toString(),
          piPriceAtTime: currentPiPrice.toString(),
          status: "pending",
          gameAccount: payment.metadata.gameAccount,
          metadata: payment.metadata
        };
        transaction = await storage.createTransaction(transactionData);
      }
      const approved = await piNetworkService.approvePayment(paymentId);
      if (!approved) {
        await storage.updateTransaction(transaction.id, { status: "failed" });
        return res.status(500).json({ message: "Payment approval failed" });
      }
      await storage.updateTransaction(transaction.id, { status: "approved" });
      res.json({ success: true, transactionId: transaction.id });
    } catch (error) {
      console.error("Payment approval error:", error);
      res.status(500).json({ message: "Payment approval failed" });
    }
  });
  app2.post("/api/payment/complete", async (req, res) => {
    try {
      const { paymentId, txid } = req.body;
      if (!paymentId || !txid) {
        return res.status(400).json({ message: "Payment ID and txid required" });
      }
      const transaction = await storage.getTransactionByPaymentId(paymentId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      const completed = await piNetworkService.completePayment(paymentId, txid);
      if (!completed) {
        await storage.updateTransaction(transaction.id, { status: "failed" });
        return res.status(500).json({ message: "Payment completion failed" });
      }
      const paymentDetails = await piNetworkService.getPayment(paymentId);
      let walletAddress = "";
      let paymentAmount = 0;
      if (paymentDetails) {
        if (paymentDetails.from_address) {
          walletAddress = paymentDetails.from_address;
        }
        if (paymentDetails.amount) {
          paymentAmount = paymentDetails.amount;
        }
      }
      if (walletAddress) {
        const user = await storage.getUser(transaction.userId);
        if (user && !user.walletAddress) {
          await storage.updateUser(transaction.userId, { walletAddress });
        }
      }
      await storage.updateTransaction(transaction.id, {
        status: "completed",
        txid
      });
      try {
        const user = await storage.getUser(transaction.userId);
        const pkg = await storage.getPackage(transaction.packageId);
        if (user && pkg && user.email) {
          const gameAccountString = transaction.gameAccount.ign ? `${transaction.gameAccount.ign} (${transaction.gameAccount.uid})` : `${transaction.gameAccount.userId}:${transaction.gameAccount.zoneId}`;
          const emailSent = await sendPurchaseConfirmationEmail({
            to: user.email,
            username: user.username,
            packageName: pkg.name,
            piAmount: transaction.piAmount,
            usdAmount: transaction.usdAmount,
            gameAccount: gameAccountString,
            transactionId: transaction.id,
            paymentId,
            isTestnet: process.env.NODE_ENV !== "production"
          });
          await storage.updateTransaction(transaction.id, { emailSent });
        }
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
      res.json({ success: true, transactionId: transaction.id, txid });
    } catch (error) {
      console.error("Payment completion error:", error);
      res.status(500).json({ message: "Payment completion failed" });
    }
  });
  app2.get("/api/transactions", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
      const transactions2 = await storage.getUserTransactions(userId);
      res.json(transactions2);
    } catch (error) {
      console.error("Transactions fetch error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.get("/api/admin/analytics", authenticateAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Analytics fetch error:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/admin/transactions", authenticateAdmin, async (req, res) => {
    try {
      const transactions2 = await storage.getAllTransactions();
      res.json(transactions2);
    } catch (error) {
      console.error("Admin transactions fetch error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  app2.get("/api/admin/packages", authenticateAdmin, async (req, res) => {
    try {
      const packages2 = await storage.getPackages();
      res.json(packages2);
    } catch (error) {
      console.error("Admin packages fetch error:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });
  app2.post("/api/admin/packages", authenticateAdmin, async (req, res) => {
    try {
      const packageData = insertPackageSchema.parse(req.body);
      const newPackage = await storage.createPackage(packageData);
      res.json(newPackage);
    } catch (error) {
      console.error("Package creation error:", error);
      res.status(500).json({ message: "Failed to create package" });
    }
  });
  app2.put("/api/admin/packages/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const updatedPackage = await storage.updatePackage(id, updateData);
      if (!updatedPackage) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(updatedPackage);
    } catch (error) {
      console.error("Package update error:", error);
      res.status(500).json({ message: "Failed to update package" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname2 = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname2, "client", "src"),
      "@shared": path.resolve(__dirname2, "shared"),
      "@assets": path.resolve(__dirname2, "attached_assets")
    }
  },
  root: path.resolve(__dirname2, "client"),
  build: {
    outDir: path.resolve(__dirname2, "dist"),
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      external: []
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    }
  },
  // Base public path for Netlify deployment
  base: "./"
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname3 = dirname2(__filename2);
var storage2 = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path3.extname(file.originalname));
  }
});
var upload = multer({ storage: storage2 });
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(upload.any());
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
registerRoutes(app).then(() => {
  app.use("/uploads", express2.static(path3.join(__dirname3, "../uploads")));
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const isServerless = process.env.VERCEL || process.env.NOW_REGION;
  if (!isServerless) {
    if (app.get("env") === "development") {
      setupVite(app, app.listen(0));
    } else {
      serveStatic(app);
    }
    const port = parseInt(process.env.PORT || "5000", 10);
    app.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`serving on port ${port}`);
    });
  } else {
    serveStatic(app);
  }
});
var index_default = app;
export {
  index_default as default
};
