import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if we're in preview mode
const isPreview = process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development';

if (!process.env.DATABASE_URL && !isPreview) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Export a function that returns the database instance
export function getDatabase() {
  // In preview mode, return a mock database
  if (isPreview) {
    console.log('Using mock database for preview mode');
    return {
      select: () => ({
        from: () => ({
          where: () => Promise.resolve([]),
          orderBy: () => Promise.resolve([]),
        }),
      }),
      insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([]),
        }),
      }),
      update: () => ({
        set: () => ({
          where: () => ({
            returning: () => Promise.resolve([]),
          }),
        }),
      }),
      delete: () => ({
        where: () => Promise.resolve([]),
      }),
    };
  }
  
  // In production mode, use the real database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle({ client: pool, schema });
}

export const db = getDatabase();