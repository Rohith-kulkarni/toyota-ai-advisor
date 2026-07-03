import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import prisma from "../lib/prisma";
import { signAccessToken } from "../utils/jwt";

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

function toSafeUser(user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function loginWithPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return null;
  }

  const token = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: toSafeUser(user),
    token,
  };
}

export async function getUserById(userId: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  return toSafeUser(user);
}
