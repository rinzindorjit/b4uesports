import { storage } from "../storage.js";
import bcrypt from 'bcrypt';

async function initializeAdmins() {
  try {
    console.log("Initializing admins...");
    
    // Check if admins already exist
    // Since we don't have a method to get all admins, we'll try to get a specific one
    const existingAdmin = await storage.getAdminByUsername('admin');
    
    if (existingAdmin) {
      console.log("Admin user already exists. Skipping initialization.");
      return;
    }
    
    console.log("No admin user found. Creating default admin user...");
    
    // Create a default admin user
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await storage.createAdmin({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@b4uesports.com',
      role: 'admin',
      isActive: true
    });
    
    console.log("Default admin user created successfully!");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Please change this password after first login for security.");
    
  } catch (error) {
    console.error("Error initializing admins:", error);
  }
}

// Run the initialization if this script is executed directly
// if (require.main === module) {
//   initializeAdmins();
// }

export { initializeAdmins };