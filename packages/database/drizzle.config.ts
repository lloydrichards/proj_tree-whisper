import type { Config } from "drizzle-kit";

export default {
  casing: "snake_case",
  out: "./migrations",
  schema: "./src/schema",
  dialect: "postgresql",
  verbose: true,
  dbCredentials: {
    url: process.env.DB_URL ?? "",
  },
} satisfies Config;
