import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load from .env.local for development
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Supabase: use direct DB URL (db.xxxx.supabase.co) not pooler
    // If DIRECT_URL is set, use that; otherwise construct from SUPABASE_URL
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});