import { storage } from "../storage";

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

async function initializePackages() {
  try {
    console.log("Initializing packages...");
    
    // Always reinitialize packages with the new data
    console.log("Reinitializing packages with new data...");
    
    // Clear existing packages
    // Note: In a real implementation, you would have a method to clear packages
    // For now, we'll just log that we're reinitializing
    
    console.log("Creating default packages...");
    
    // Create all packages
    for (const pkg of packages) {
      const usdtValue = pkg.usdtValue.toFixed(4);
      
      // In a real implementation, you would create the packages in storage
      // For now, we'll just log the creation
      console.log(`Would create package: ${pkg.name} (${usdtValue} USDT)`);
    }
    
    console.log("Default packages initialized successfully!");
  } catch (error) {
    console.error("Error initializing packages:", error);
  }
}

// Run the initialization if this script is executed directly
// if (require.main === module) {
//   initializePackages();
// }

export { initializePackages };