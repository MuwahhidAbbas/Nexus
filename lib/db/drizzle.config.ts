import { defineConfig } from "drizzle-kit";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Auto-load .env from common project locations (Node 20+ built-in)
const envCandidates = [
  resolve(__dirname, "../../.env"),
  resolve(__dirname, "../../artifacts/api-server/.env"),
  resolve(__dirname, ".env"),
];
for (const candidate of envCandidates) {
  if (existsSync(candidate)) {
    if (typeof (process as any).loadEnvFile === "function") {
      (process as any).loadEnvFile(candidate);
    }
    break;
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL not found. Create a .env file in the project root or in artifacts/api-server/ with DATABASE_URL set.",
  );
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
