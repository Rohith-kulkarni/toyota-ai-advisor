import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";

export const healthRouter = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health check
 *     operationId: getHealth
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - service
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: toyota-ai-advisor-backend
 */
healthRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    res.json({
      status: "ok",
      service: "toyota-ai-advisor-backend",
    });
  })
);
