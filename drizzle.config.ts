import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./features/shared/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // Use non-pooling URL for DDL/migrations (direct connection, no PgBouncer)
    url: process.env.POSTGRES_URL_NON_POOLING!,
  },
});
