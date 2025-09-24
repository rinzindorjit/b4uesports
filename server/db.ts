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
    
    // Mock data storage
    const mockData: any = {
      users: [],
      packages: [],
      transactions: [],
      admins: [],
      piPriceHistory: []
    };
    
    return {
      select: () => ({
        from: (table: any) => {
          const tableName = Object.keys(schema).find(key => schema[key] === table);
          return {
            where: () => Promise.resolve(mockData[tableName] || []),
            orderBy: () => Promise.resolve(mockData[tableName] || []),
          };
        },
      }),
      insert: (table: any) => {
        const tableName = Object.keys(schema).find(key => schema[key] === table);
        return {
          values: (values: any) => {
            const newValues = Array.isArray(values) ? values : [values];
            if (mockData[tableName]) {
              mockData[tableName].push(...newValues.map((val: any, index: number) => ({
                ...val,
                id: val.id || `mock-${tableName}-${Date.now()}-${index}`,
                createdAt: val.createdAt || new Date().toISOString(),
                updatedAt: val.updatedAt || new Date().toISOString()
              })));
            }
            return {
              returning: () => Promise.resolve(newValues.map((val: any, index: number) => ({
                ...val,
                id: val.id || `mock-${tableName}-${Date.now()}-${index}`,
                createdAt: val.createdAt || new Date().toISOString(),
                updatedAt: val.updatedAt || new Date().toISOString()
              })))
            };
          },
        };
      },
      update: (table: any) => {
        const tableName = Object.keys(schema).find(key => schema[key] === table);
        return {
          set: (updateData: any) => ({
            where: () => {
              if (mockData[tableName] && mockData[tableName].length > 0) {
                // Update the first item as a mock
                mockData[tableName][0] = {
                  ...mockData[tableName][0],
                  ...updateData,
                  updatedAt: new Date().toISOString()
                };
              }
              return {
                returning: () => Promise.resolve([mockData[tableName][0]].filter(Boolean))
              };
            },
          }),
        };
      },
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