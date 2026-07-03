import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import { env } from "../config/env";

export const AUTH_COOKIE_NAME = "toyota_access_token";

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

export function signAccessToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, env.jwtAccessSecret, options);
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.jwtAccessSecret);

  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }

  return {
    userId: String(decoded.userId),
    email: String(decoded.email),
    role: decoded.role as UserRole,
  };
}

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: env.jwtCookieMaxAgeMs,
    path: "/",
  };
}

export function getClearedAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  };
}
