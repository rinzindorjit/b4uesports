import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  piUID: text("pi_uid").notNull().unique(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull().default("Bhutan"),
  language: text("language").notNull().default("en"),
  walletAddress: text("wallet_address").notNull(),
  profileImage: text("profile_image"), // URL to user's profile image
  gameAccounts: jsonb("game_accounts").$type<{
    pubg?: { ign: string; uid: string };
    mlbb?: { userId: string; zoneId: string };
  }>(),
  referralCode: text("referral_code"),
  passphrase: text("passphrase"), // hashed passphrase for payment confirmation
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const packages = pgTable("packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  game: text("game").notNull(), // "PUBG" or "MLBB"
  name: text("name").notNull(), // e.g., "660 UC", "571 Diamonds"
  inGameAmount: integer("in_game_amount").notNull(),
  usdtValue: decimal("usdt_value", { precision: 10, scale: 4 }).notNull(),
  image: text("image").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  packageId: varchar("package_id").notNull().references(() => packages.id),
  paymentId: text("payment_id").notNull().unique(), // Pi Network payment ID
  txid: text("txid"), // blockchain transaction ID
  piAmount: decimal("pi_amount", { precision: 18, scale: 8 }).notNull(),
  usdAmount: decimal("usd_amount", { precision: 10, scale: 4 }).notNull(),
  piPriceAtTime: decimal("pi_price_at_time", { precision: 10, scale: 4 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, completed, failed, cancelled
  gameAccount: jsonb("game_account").$type<{
    ign?: string;
    uid?: string;
    userId?: string;
    zoneId?: string;
  }>().notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  emailSent: boolean("email_sent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // hashed password
  email: text("email").notNull(),
  role: text("role").notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const piPriceHistory = pgTable("pi_price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  price: decimal("price", { precision: 10, scale: 4 }).notNull(),
  source: text("source").notNull().default("coingecko"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
}));

export const packagesRelations = relations(packages, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  package: one(packages, {
    fields: [transactions.packageId],
    references: [packages.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Package = typeof packages.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type PiPriceHistory = typeof piPriceHistory.$inferSelect;