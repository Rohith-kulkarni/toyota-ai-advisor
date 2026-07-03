import type { Request, Response } from "express";
import { loginSchema } from "../validators/auth.validator";
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getClearedAuthCookieOptions,
} from "../utils/jwt";
import { getUserById, loginWithPassword } from "../services/auth.service";

function getValidationMessage(message: string): string {
  return message || "Invalid request body";
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: getValidationMessage(result.error.issues[0]?.message),
    });
    return;
  }

  const authResult = await loginWithPassword(result.data.email, result.data.password);

  if (!authResult) {
    res.status(401).json({
      message: "Invalid credentials",
    });
    return;
  }

  res.cookie(AUTH_COOKIE_NAME, authResult.token, getAuthCookieOptions());
  res.json({
    status: "ok",
    user: authResult.user,
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await getUserById(req.user.id);

  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.json({
    status: "ok",
    user,
  });
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, getClearedAuthCookieOptions());
  res.json({
    status: "ok",
    message: "Logged out successfully",
  });
}

export function protectedTest(_req: Request, res: Response): void {
  res.json({
    status: "ok",
    message: "You are authenticated",
  });
}

export const authController = {
  login,
  me,
  logout,
  protectedTest,
};
