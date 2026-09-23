import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (database) return database;
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error("DATABASE_URL is not configured. Use the Supabase transaction-pooler connection string.");
  const client = postgres(connectionString, { max: 1, prepare: false });
  database = drizzle(client, { schema });
  return database;
}
