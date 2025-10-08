import { createClient } from "@supabase/supabase-js";
if (process.env.NODE_ENV !== "development" && (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY)) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_ANON_KEY must be set for production."
  );
}
let supabaseClient = null;
let dbClient;
if (process.env.NODE_ENV === "development") {
  console.log("Using mock database for development");
  dbClient = {
    select: () => ({ from: () => Promise.resolve([]) }),
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }),
    delete: () => ({ where: () => Promise.resolve([]) })
  };
  supabaseClient = null;
} else {
  supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  dbClient = {
    select: () => ({
      from: (table) => supabaseClient.from(table).select()
    }),
    insert: (table) => ({
      values: (data) => ({
        returning: () => supabaseClient.from(table).insert(data)
      })
    }),
    update: (table) => ({
      set: (data) => ({
        where: (condition) => ({
          // @ts-ignore - Suppress TypeScript error for match method
          returning: () => supabaseClient.from(table).update(data).match(condition)
        })
      })
    }),
    delete: (table) => ({
      // @ts-ignore - Suppress TypeScript error for match method
      where: (condition) => supabaseClient.from(table).delete().match(condition)
    })
  };
}
export {
  dbClient as db,
  supabaseClient as supabase
};
