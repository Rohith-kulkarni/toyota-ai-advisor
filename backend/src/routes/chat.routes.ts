import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { chatController } from "../controllers/chat.controller";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware";

export const chatRoutes = Router();

/**
 * @openapi
 * /api/chat/message:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Send a message to the local Toyota knowledge chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               message:
 *                 type: string
 *                 example: I need a family car under 20 lakh
 *     responses:
 *       200:
 *         description: Chat response generated from local knowledge
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Chat session not found
 */
chatRoutes.post("/message", asyncHandler(chatController.sendMessage));

/**
 * @openapi
 * /api/chat/sessions/{sessionId}/messages:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get all messages for a chat session
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Chat messages in createdAt order
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Chat session not found
 */
chatRoutes.get(
  "/sessions/:sessionId/messages",
  requireAuth,
  requireAdmin,
  asyncHandler(chatController.getSessionMessages)
);
