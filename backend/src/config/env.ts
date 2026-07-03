import dotenv from "dotenv";

dotenv.config();

type NodeEnv = "development" | "production" | "test";

function getRequiredString(name: string, fallback: string): string {
  const value = process.env[name]?.trim() || fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getPort(value: string): number {
  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PORT must be a valid positive number");
  }

  return port;
}

function getNodeEnv(value: string): NodeEnv {
  if (value === "development" || value === "production" || value === "test") {
    return value;
  }

  throw new Error("NODE_ENV must be development, production, or test");
}

const portValue = getRequiredString("PORT", "4000");
const nodeEnvValue = getRequiredString("NODE_ENV", "development");
const corsOrigin = getRequiredString("CORS_ORIGIN", "http://localhost:3000");
const databaseUrl = getRequiredString("DATABASE_URL", "");

export const env = {
  port: getPort(portValue),
  nodeEnv: getNodeEnv(nodeEnvValue),
  corsOrigin,
  databaseUrl,
  serviceName: "toyota-ai-advisor-backend",
} as const;
