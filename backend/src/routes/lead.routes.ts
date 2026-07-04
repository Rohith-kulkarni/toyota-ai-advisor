import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { leadController } from "../controllers/lead.controller";
import { requireAdmin, requireAuth } from "../middleware/auth.middleware";

export const leadRoutes = Router();

// TODO: protect n8n internal endpoints with an API key before production client rollout.

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
 *               testDriveRequested:
 *                 type: boolean
 *                 example: true
 *               preferredTestDriveDate:
 *                 type: string
 *                 example: 2026-07-05
 *               preferredTestDriveTime:
 *                 type: string
 *                 example: Morning
 *               testDriveLocation:
 *                 type: string
 *                 example: Hyderabad showroom
 *               financeAssistanceRequested:
 *                 type: boolean
 *                 example: true
 *               monthlyIncomeRange:
 *                 type: string
 *                 example: 1-2 lakh
 *               downPaymentBudget:
 *                 type: string
 *                 example: 5 lakh
 *               loanTenurePreference:
 *                 type: string
 *                 example: 5 years
 *               emiBudget:
 *                 type: string
 *                 example: 30000
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
 *   post:
 *     tags:
 *       - Leads
 *     summary: Create a lead for n8n compatibility
 *     operationId: createLead
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
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
 *               modelInterest:
 *                 type: string
 *                 example: Innova Hycross
 *               intent:
 *                 type: string
 *                 example: test drive
 *               source:
 *                 type: string
 *                 example: ai_advisor_chat
 *     responses:
 *       201:
 *         description: Lead created successfully
 *       400:
 *         description: Invalid request body
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
leadRoutes.post("/", asyncHandler(leadController.createLeadEntry));
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
 * /api/leads/{id}/test-drive:
 *   patch:
 *     tags:
 *       - Leads
 *     summary: Update a lead test drive details
 *     operationId: updateLeadTestDrive
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
 *               - testDriveRequested
 *             properties:
 *               testDriveRequested:
 *                 type: boolean
 *                 example: true
 *               preferredTestDriveDate:
 *                 type: string
 *                 example: 2026-07-05
 *               preferredTestDriveTime:
 *                 type: string
 *                 example: Morning
 *               testDriveLocation:
 *                 type: string
 *                 example: Hyderabad showroom
 *     responses:
 *       200:
 *         description: Test drive details updated
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
  "/:id/test-drive",
  requireAuth,
  requireAdmin,
  asyncHandler(leadController.changeLeadTestDrive)
);

/**
 * @swagger
 * /api/leads/{id}/finance:
 *   patch:
 *     tags:
 *       - Leads
 *     summary: Update a lead finance details
 *     operationId: updateLeadFinance
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
 *               - financeAssistanceRequested
 *             properties:
 *               financeAssistanceRequested:
 *                 type: boolean
 *                 example: true
 *               monthlyIncomeRange:
 *                 type: string
 *                 example: 1-2 lakh
 *               downPaymentBudget:
 *                 type: string
 *                 example: 5 lakh
 *               loanTenurePreference:
 *                 type: string
 *                 example: 5 years
 *               emiBudget:
 *                 type: string
 *                 example: 30000
 *     responses:
 *       200:
 *         description: Finance details updated
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
  "/:id/finance",
  requireAuth,
  requireAdmin,
  asyncHandler(leadController.changeLeadFinance)
);

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

/**
 * @swagger
 * /api/leads/{id}/insights:
 *   post:
 *     tags:
 *       - Leads
 *     summary: Generate rule-based lead insights
 *     operationId: generateLeadInsights
 *     description: Creates a simple chat summary and lead score from the stored lead data and linked chat messages.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead insights generated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lead not found
 */
leadRoutes.post(
  "/:id/insights",
  requireAuth,
  requireAdmin,
  asyncHandler(leadController.generateInsights)
);
