import { createClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";

// Only require Supabase config in production mode
if (process.env.NODE_ENV !== 'development' && 
    (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY)) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_ANON_KEY must be set for production.",
  );
}

let supabaseClient: ReturnType<typeof createClient> | null = null;
let dbClient: any;

// Use mock database in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Using mock database for development');
  // Export a mock db object for development
  dbClient = {
    select: () => ({ from: () => Promise.resolve([]) }),
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }),
    delete: () => ({ where: () => Promise.resolve([]) }),
  } as any;
  
  supabaseClient = null;
} else {
  // Use Supabase in production
  supabaseClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
  
  // For compatibility with existing code, we'll create a simple wrapper
  dbClient = {
    select: () => ({
      from: (table: string) => supabaseClient!.from(table).select(),
    }),
    insert: (table: string) => ({
      values: (data: any) => ({
        returning: () => supabaseClient!.from(table).insert(data),
      }),
    }),
    update: (table: string) => ({
      set: (data: any) => ({
        where: (condition: any) => ({
          returning: () => supabaseClient!.from(table).update(data).match(condition),
        }),
      }),
    }),
    delete: (table: string) => ({
      where: (condition: any) => supabaseClient!.from(table).delete().match(condition),
    }),
  };
}

export { supabaseClient as supabase, dbClient as db };