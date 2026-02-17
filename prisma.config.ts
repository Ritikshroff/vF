// Prisma configuration for Viralfluencer
// See: https://pris.ly/d/config-datasource
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // For migrations: prefer direct connection (bypasses PgBouncer)
    // For runtime: PrismaPg adapter in src/lib/db/prisma.ts uses DATABASE_URL (pooled)
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
