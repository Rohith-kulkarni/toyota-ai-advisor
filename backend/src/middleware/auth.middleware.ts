import type { RequestHandler } from "express";
import prisma from "../lib/prisma";
import { AUTH_COOKIE_NAME, verifyAccessToken } from "../utils/jwt";

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token || typeof token !== "string") {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
