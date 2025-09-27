// Database connection utility for Vercel API routes
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Create database connection
let db;

// Initialize database connection
function initDb() {
  if (!db) {
    try {
      // Get database URL from environment variables
      const databaseUrl = process.env.DATABASE_URL;
      
      if (!databaseUrl) {
        console.warn("⚠️ DATABASE_URL not set, using mock database operations");
        return null;
      }
      
      // Create Neon client
      const client = neon(databaseUrl);
      
      // Create Drizzle ORM instance
      db = drizzle(client);
      
      console.log("✅ Database connection initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize database connection:", error.message);
      return null;
    }
  }
  
  return db;
}

// Initialize database on module load
initDb();

// Export database instance and helper functions
export { db, initDb };