import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

export const authRouter = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login as admin
 *     operationId: loginAdmin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@toyota-ai.local
 *               password:
 *                 type: string
 *                 example: Admin@12345
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - user
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Invalid credentials
 */
authRouter.post("/login", asyncHandler(authController.login));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get the currently authenticated user
 *     operationId: getCurrentUser
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - status
 *                 - user
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
authRouter.get("/me", requireAuth, asyncHandler(authController.me));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout the current user
 *     operationId: logoutAdmin
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 */
authRouter.post("/logout", asyncHandler(authController.logout));

/**
 * @swagger
 * /api/auth/protected-test:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Test protected route access
 *     operationId: protectedTest
 *     responses:
 *       200:
 *         description: You are authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: You are authenticated
 *       401:
 *         description: Unauthorized
 */
authRouter.get("/protected-test", requireAuth, asyncHandler(authController.protectedTest));
