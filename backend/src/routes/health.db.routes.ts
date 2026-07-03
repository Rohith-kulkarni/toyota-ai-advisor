import { Router } from "express";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";

export const dbHealthRouter = Router();

/**
 * @swagger
 * /api/health/db:
 *   get:
 *     tags:
 *       - Health
 *     summary: Database health check
 *     operationId: getDatabaseHealth
 *     responses:
 *       200:
 *         description: Database is connected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - database
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 database:
 *                   type: string
 *                   example: connected
 */
dbHealthRouter.get(
  "/health/db",
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
    });
  })
);
