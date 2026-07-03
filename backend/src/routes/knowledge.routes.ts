import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { knowledgeController } from "../controllers/knowledge.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

export const knowledgeRouter = Router();

/**
 * @openapi
 * /api/knowledge/models:
 *   get:
 *     tags:
 *       - Knowledge
 *     summary: Get all Toyota model summaries
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
 * @openapi
 * /api/knowledge/models/{slug}:
 *   get:
 *     tags:
 *       - Knowledge
 *     summary: Get a Toyota model by slug
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
 * @openapi
 * /api/knowledge/search:
 *   get:
 *     tags:
 *       - Knowledge
 *     summary: Search local Toyota knowledge
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
