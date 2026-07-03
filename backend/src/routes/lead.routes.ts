import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { leadController } from "../controllers/lead.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";

export const leadRoutes = Router();

/**
 * @swagger
 * /api/leads/from-chat:
 *   post:
 *     tags:
 *       - Leads
 *     summary: Create a lead from a chat session
 *     operationId: createLeadFromChat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - phone
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *               name:
 *                 type: string
 *                 example: Rohith
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               city:
 *                 type: string
 *                 example: Hyderabad
 *               interestedModel:
 *                 type: string
 *                 example: Innova Hycross
 *               budget:
 *                 type: string
 *                 example: 20-30 lakh
 *               purchaseTimeline:
 *                 type: string
 *                 example: Within 1 month
 *               notes:
 *                 type: string
 *                 example: Looking for hybrid automatic family car
 *     responses:
 *       201:
 *         description: Lead created successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Chat session not found
 */
leadRoutes.post("/from-chat", asyncHandler(leadController.createFromChat));

/**
 * @swagger
 * /api/leads:
 *   get:
 *     tags:
 *       - Leads
 *     summary: Get all leads
 *     operationId: listLeads
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [NEW, CONTACTED, TEST_DRIVE_SCHEDULED, CONVERTED, LOST]
 *       - in: query
 *         name: city
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: interestedModel
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of leads
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
leadRoutes.get("/", requireAuth, requireAdmin, asyncHandler(leadController.listLeads));

/**
 * @swagger
 * /api/leads/{id}:
 *   get:
 *     tags:
 *       - Leads
 *     summary: Get a lead by id
 *     operationId: getLeadById
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lead not found
 */
leadRoutes.get("/:id", requireAuth, requireAdmin, asyncHandler(leadController.getLead));

/**
 * @swagger
 * /api/leads/{id}/status:
 *   patch:
 *     tags:
 *       - Leads
 *     summary: Update a lead status
 *     operationId: updateLeadStatus
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [NEW, CONTACTED, TEST_DRIVE_SCHEDULED, CONVERTED, LOST]
 *     responses:
 *       200:
 *         description: Lead status updated
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lead not found
 */
leadRoutes.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  asyncHandler(leadController.changeLeadStatus)
);

/**
 * @swagger
 * /api/leads/{id}/notes:
 *   patch:
 *     tags:
 *       - Leads
 *     summary: Update a lead notes field
 *     operationId: updateLeadNotes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notes
 *             properties:
 *               notes:
 *                 type: string
 *                 example: Customer asked for callback tomorrow
 *     responses:
 *       200:
 *         description: Lead notes updated
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lead not found
 */
leadRoutes.patch(
  "/:id/notes",
  requireAuth,
  requireAdmin,
  asyncHandler(leadController.changeLeadNotes)
);
