import { storage } from "../storage.js";
import { PACKAGE_IMAGES } from "../../client/src/lib/constants.js";
async function updatePackageImages() {
  try {
    console.log("Updating package images...");
    const packages = await storage.getPackages();
    console.log(`Found ${packages.length} packages to update`);
    for (const pkg of packages) {
      const imageUrl = pkg.game === "PUBG" ? PACKAGE_IMAGES.PUBG : PACKAGE_IMAGES.MLBB;
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
export {
  updatePackageImages
};
