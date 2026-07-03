import { z } from "zod";

export const chatMessageSchema = z.object({
  sessionId: z.string().trim().min(1).optional(),
  message: z.string().trim().min(1, "Message is required"),
});

export const chatSessionParamsSchema = z.object({
  sessionId: z.string().trim().min(1, "Session ID is required"),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ChatSessionParams = z.infer<typeof chatSessionParamsSchema>;
