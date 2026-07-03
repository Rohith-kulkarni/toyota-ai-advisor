import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";
import { env } from "../src/config/env";

async function main(): Promise<void> {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: env.adminSeedEmail,
    },
  });

  if (existingUser) {
    console.log(`Admin user already exists: ${env.adminSeedEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(env.adminSeedPassword, 10);

  await prisma.user.create({
    data: {
      name: env.adminSeedName,
      email: env.adminSeedEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin user created: ${env.adminSeedEmail}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
