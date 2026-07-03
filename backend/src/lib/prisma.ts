import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: env.databaseUrl,
    },
  },
});

export default prismaClient;
