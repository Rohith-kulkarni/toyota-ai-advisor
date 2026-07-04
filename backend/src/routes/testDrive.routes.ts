import { Router } from "express";
import { leadController } from "../controllers/lead.controller";
import { asyncHandler } from "../utils/asyncHandler";

export const testDriveRoutes = Router();

// TODO: protect n8n internal endpoints with an API key before production client rollout.

/**
 * @swagger
 * /api/test-drives:
 *   post:
 *     tags:
 *       - Test Drives
 *     summary: Log a test drive request for n8n compatibility
 *     operationId: createTestDriveRequest
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - branch
 *               - model
 *               - preferredDate
 *               - preferredTime
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: Rohith
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               branch:
 *                 type: string
 *                 example: Sanathnagar
 *               model:
 *                 type: string
 *                 example: Hyryder
 *               preferredDate:
 *                 type: string
 *                 example: 2026-07-05
 *               preferredTime:
 *                 type: string
 *                 example: Morning
 *               status:
 *                 type: string
 *                 example: pending_confirmation
 *               source:
 *                 type: string
 *                 example: ai_advisor
 *     responses:
 *       201:
 *         description: Test drive request logged
 *       400:
 *         description: Invalid request body or unsupported branch
 */
testDriveRoutes.post("/", asyncHandler(leadController.createTestDriveEntry));
