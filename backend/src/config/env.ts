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

function getJwtMaxAgeMs(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error("JWT_EXPIRES_IN must be a simple duration like 7d, 12h, 30m, or 45s");
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error("JWT_EXPIRES_IN has an unsupported duration unit");
  }
}

const portValue = getRequiredString("PORT", "4000");
const nodeEnvValue = getRequiredString("NODE_ENV", "development");
const corsOrigin = getRequiredString("CORS_ORIGIN", "http://localhost:3000");
const databaseUrl = getRequiredString("DATABASE_URL", "");
const jwtAccessSecret = getRequiredString("JWT_ACCESS_SECRET", "");
const jwtExpiresIn = getRequiredString("JWT_EXPIRES_IN", "");
const adminSeedName = getRequiredString("ADMIN_SEED_NAME", "");
const adminSeedEmail = getRequiredString("ADMIN_SEED_EMAIL", "");
const adminSeedPassword = getRequiredString("ADMIN_SEED_PASSWORD", "");

export const env = {
  port: getPort(portValue),
  nodeEnv: getNodeEnv(nodeEnvValue),
  corsOrigin,
  databaseUrl,
  jwtAccessSecret,
  jwtExpiresIn,
  jwtCookieMaxAgeMs: getJwtMaxAgeMs(jwtExpiresIn),
  adminSeedName,
  adminSeedEmail,
  adminSeedPassword,
  serviceName: "toyota-ai-advisor-backend",
} as const;
