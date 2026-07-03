import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { knowledgeController } from "../controllers/knowledge.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

export const knowledgeRouter = Router();

/**
 * @swagger
 * /api/knowledge/models:
 *   get:
 *     tags:
 *       - Knowledge
 *     summary: Get all Toyota model summaries
 *     operationId: getToyotaModelSummaries
 *     responses:
 *       200:
 *         description: List of Toyota model summaries
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
knowledgeRouter.get(
  "/models",
  requireAuth,
  requireAdmin,
  asyncHandler(knowledgeController.getModels)
);

/**
 * @swagger
 * /api/knowledge/models/{slug}:
 *   get:
 *     tags:
 *       - Knowledge
 *     summary: Get a Toyota model by slug
 *     operationId: getToyotaModelBySlug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: innova-hycross
 *     responses:
 *       200:
 *         description: Toyota model details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Toyota model not found
 */
knowledgeRouter.get(
  "/models/:slug",
  requireAuth,
  requireAdmin,
  asyncHandler(knowledgeController.getModelBySlug)
);

/**
 * @swagger
 * /api/knowledge/search:
 *   get:
 *     tags:
 *       - Knowledge
 *     summary: Search local Toyota knowledge
 *     operationId: searchToyotaKnowledge
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         example: family
 *     responses:
 *       200:
 *         description: Matching Toyota models
 *       400:
 *         description: Query parameter q is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
knowledgeRouter.get(
  "/search",
  requireAuth,
  requireAdmin,
  asyncHandler(knowledgeController.searchKnowledge)
);
