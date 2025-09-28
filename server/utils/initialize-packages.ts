import { storage } from "../storage";
import { DEFAULT_PACKAGES, PACKAGE_IMAGES } from "../../client/src/lib/constants";

async function initializePackages() {
  try {
    console.log("Initializing packages...");
    
    // Check if packages already exist
    const existingPackages = await storage.getPackages();
    
    if (existingPackages.length > 0) {
      console.log(`Found ${existingPackages.length} existing packages. Skipping initialization.`);
      return;
    }
    
    console.log("No existing packages found. Creating default packages...");
    
    // Create PUBG packages
    for (const pkg of DEFAULT_PACKAGES.PUBG) {
      const packageName = `${pkg.amount} UC`;
      const usdtValue = pkg.usdtValue.toFixed(4);
      
      await storage.createPackage({
        game: 'PUBG',
        name: packageName,
        inGameAmount: pkg.amount,
        usdtValue: usdtValue,
        image: PACKAGE_IMAGES.PUBG,
        isActive: true
      });
      
      console.log(`Created PUBG package: ${packageName} (${usdtValue} USDT)`);
    }
    
    // Create MLBB packages
    for (const pkg of DEFAULT_PACKAGES.MLBB) {
      const packageName = `${pkg.amount} Diamonds`;
      const usdtValue = pkg.usdtValue.toFixed(4);
      
      await storage.createPackage({
        game: 'MLBB',
        name: packageName,
        inGameAmount: pkg.amount,
        usdtValue: usdtValue,
        image: PACKAGE_IMAGES.MLBB,
        isActive: true
      });
      
      console.log(`Created MLBB package: ${packageName} (${usdtValue} USDT)`);
    }
    
    console.log("Default packages initialized successfully!");
  } catch (error) {
    console.error("Error initializing packages:", error);
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializePackages();
}

export { initializePackages };