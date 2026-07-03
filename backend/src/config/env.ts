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

function getOptionalString(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function getBoolean(name: string, fallback: boolean): boolean {
  const rawValue = process.env[name]?.trim().toLowerCase();

  if (!rawValue) {
    return fallback;
  }

  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  throw new Error(`${name} must be true or false`);
}

function parseList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

function getAiProvider(value: string): "gemini" {
  if (value.toLowerCase() === "gemini") {
    return "gemini";
  }

  throw new Error("AI_PROVIDER must be gemini");
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
const corsOrigins = parseList(corsOrigin);

if (corsOrigins.length === 0) {
  throw new Error("CORS_ORIGIN must include at least one allowed origin");
}

const databaseUrl = getRequiredString("DATABASE_URL", "");
const jwtAccessSecret = getRequiredString("JWT_ACCESS_SECRET", "");
const jwtExpiresIn = getRequiredString("JWT_EXPIRES_IN", "");
const adminSeedName = getRequiredString("ADMIN_SEED_NAME", "");
const adminSeedEmail = getRequiredString("ADMIN_SEED_EMAIL", "");
const adminSeedPassword = getRequiredString("ADMIN_SEED_PASSWORD", "");
const aiEnabled = getBoolean("AI_ENABLED", false);
const aiProvider = getAiProvider(getRequiredString("AI_PROVIDER", "gemini"));
const geminiModel = getRequiredString("GEMINI_MODEL", "gemini-2.5-flash");
const geminiApiKey = getOptionalString("GEMINI_API_KEY");

if (aiEnabled && aiProvider === "gemini" && !geminiApiKey) {
  throw new Error("GEMINI_API_KEY is required when AI_ENABLED=true and AI_PROVIDER=gemini");
}

export const env = {
  port: getPort(portValue),
  nodeEnv: getNodeEnv(nodeEnvValue),
  corsOrigin,
  corsOrigins,
  databaseUrl,
  jwtAccessSecret,
  jwtExpiresIn,
  jwtCookieMaxAgeMs: getJwtMaxAgeMs(jwtExpiresIn),
  adminSeedName,
  adminSeedEmail,
  adminSeedPassword,
  aiEnabled,
  aiProvider,
  geminiModel,
  geminiApiKey,
  serviceName: "toyota-ai-advisor-backend",
} as const;
