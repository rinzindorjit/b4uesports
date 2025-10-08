const mockUsers = [];
const mockPackages = [];
const mockTransactions = [];
const mockAdmins = [];
const mockPriceHistory = [];
function initializeMockPackages() {
  if (mockPackages.length === 0) {
    const pubgPackages = [
      { amount: 325, usdtValue: 6.5 },
      { amount: 660, usdtValue: 12 },
      { amount: 1800, usdtValue: 25 },
      { amount: 3850, usdtValue: 49 },
      { amount: 8100, usdtValue: 96 },
      { amount: 16200, usdtValue: 186 },
      { amount: 24300, usdtValue: 278 },
      { amount: 32400, usdtValue: 369 },
      { amount: 40500, usdtValue: 459 }
    ];
    const mlbbPackages = [
      { amount: 278, usdtValue: 6 },
      { amount: 571, usdtValue: 11 },
      { amount: 1783, usdtValue: 33 },
      { amount: 3005, usdtValue: 52 },
      { amount: 6012, usdtValue: 99 },
      { amount: 12e3, usdtValue: 200 }
    ];
    pubgPackages.forEach((pkg, index) => {
      const packageName = `${pkg.amount} UC`;
      const usdtValue = pkg.usdtValue.toFixed(4);
      mockPackages.push({
        id: `pkg_pubg_${index + 1}`,
        game: "PUBG",
        name: packageName,
        inGameAmount: pkg.amount,
        usdtValue,
        image: "https://cdn.midasbuy.com/images/apps/pubgm/1599546041426W8hmErMS.png",
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
    });
    mlbbPackages.forEach((pkg, index) => {
      const packageName = `${pkg.amount} Diamonds`;
      const usdtValue = pkg.usdtValue.toFixed(4);
      mockPackages.push({
        id: `pkg_mlbb_${index + 1}`,
        game: "MLBB",
        name: packageName,
        inGameAmount: pkg.amount,
        usdtValue,
        image: "https://b4uesports.com/wp-content/uploads/2025/04/1000077486.png",
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
    });
  }
}
initializeMockPackages();
class MockStorage {
  // Users
  async getUser(id) {
    return mockUsers.find((user) => user.id === id);
  }
  async getUserByPiUID(piUID) {
    return mockUsers.find((user) => user.piUID === piUID);
  }
  async createUser(user) {
    const newUser = {
      ...user,
      id: `user_${mockUsers.length + 1}`,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    mockUsers.push(newUser);
    return newUser;
  }
  async updateUser(id, user) {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) return void 0;
    mockUsers[index] = {
      ...mockUsers[index],
      ...user,
      updatedAt: /* @__PURE__ */ new Date()
    };
    return mockUsers[index];
  }
  // Packages
  async getPackages() {
    return mockPackages;
  }
  async getActivePackages() {
    return mockPackages.filter((pkg) => pkg.isActive);
  }
  async getPackage(id) {
    return mockPackages.find((pkg) => pkg.id === id);
  }
  async createPackage(pkg) {
    const newPackage = {
      ...pkg,
      id: `pkg_${mockPackages.length + 1}`,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    mockPackages.push(newPackage);
    return newPackage;
  }
  async updatePackage(id, pkg) {
    const index = mockPackages.findIndex((p) => p.id === id);
    if (index === -1) return void 0;
    mockPackages[index] = {
      ...mockPackages[index],
      ...pkg,
      updatedAt: /* @__PURE__ */ new Date()
    };
    return mockPackages[index];
  }
  // Transactions
  async getTransaction(id) {
    return mockTransactions.find((tx) => tx.id === id);
  }
  async getTransactionByPaymentId(paymentId) {
    return mockTransactions.find((tx) => tx.paymentId === paymentId);
  }
  async getUserTransactions(userId) {
    return mockTransactions.filter((tx) => tx.userId === userId);
  }
  async createTransaction(transaction) {
    const newTransaction = {
      ...transaction,
      id: `tx_${mockTransactions.length + 1}`,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    mockTransactions.push(newTransaction);
    return newTransaction;
  }
  async updateTransaction(id, transaction) {
    const index = mockTransactions.findIndex((tx) => tx.id === id);
    if (index === -1) return void 0;
    mockTransactions[index] = {
      ...mockTransactions[index],
      ...transaction,
      updatedAt: /* @__PURE__ */ new Date()
    };
    return mockTransactions[index];
  }
  async getAllTransactions() {
    return mockTransactions.map((tx) => ({
      ...tx,
      user: mockUsers.find((u) => u.id === tx.userId) || mockUsers[0],
      package: mockPackages.find((p) => p.id === tx.packageId) || mockPackages[0]
    }));
  }
  // Admins
  async getAdminByUsername(username) {
    return mockAdmins.find((admin) => admin.username === username);
  }
  async createAdmin(admin) {
    const newAdmin = {
      ...admin,
      id: `admin_${mockAdmins.length + 1}`,
      createdAt: /* @__PURE__ */ new Date(),
      lastLogin: null
    };
    mockAdmins.push(newAdmin);
    return newAdmin;
  }
  async updateAdminLastLogin(id) {
    const admin = mockAdmins.find((a) => a.id === id);
    if (admin) {
      admin.lastLogin = /* @__PURE__ */ new Date();
    }
  }
  // Pi Price History
  async savePiPrice(price) {
    const newPrice = {
      id: `price_${mockPriceHistory.length + 1}`,
      price: price.toString(),
      source: "coingecko",
      timestamp: /* @__PURE__ */ new Date()
    };
    mockPriceHistory.push(newPrice);
    return newPrice;
  }
  async getLatestPiPrice() {
    if (mockPriceHistory.length === 0) return void 0;
    return mockPriceHistory[mockPriceHistory.length - 1];
  }
  // Analytics
  async getAnalytics() {
    const completedTransactions = mockTransactions.filter((tx) => tx.status === "completed");
    const totalRevenue = completedTransactions.reduce((sum, tx) => sum + parseFloat(tx.piAmount || "0"), 0);
    const successRate = mockTransactions.length > 0 ? completedTransactions.length / mockTransactions.length * 100 : 0;
    return {
      totalUsers: mockUsers.length,
      totalTransactions: mockTransactions.length,
      totalRevenue,
      successRate: Math.round(successRate * 100) / 100
    };
  }
}
const storage = new MockStorage();
export {
  MockStorage,
  storage
};
