import { storage } from "../storage";
import { PACKAGE_IMAGES } from "../../client/src/lib/constants";

async function updatePackageImages() {
  try {
    console.log("Updating package images...");
    
    // Get all packages
    const packages = await storage.getPackages();
    
    console.log(`Found ${packages.length} packages to update`);
    
    // Update each package with the appropriate image
    for (const pkg of packages) {
      const imageUrl = pkg.game === 'PUBG' ? PACKAGE_IMAGES.PUBG : PACKAGE_IMAGES.MLBB;
      
      await storage.updatePackage(pkg.id, {
        image: imageUrl
      });
      
      console.log(`Updated package ${pkg.name} with image: ${imageUrl}`);
    }
    
    console.log("Package images updated successfully!");
  } catch (error) {
    console.error("Error updating package images:", error);
  }
}

// Run the update if this script is executed directly
if (require.main === module) {
  updatePackageImages();
}

export { updatePackageImages };