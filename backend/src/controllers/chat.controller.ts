import type { Request, Response } from "express";
import { handleChatMessage, getChatSessionMessages } from "../services/chat.service";
import { chatMessageSchema, chatSessionParamsSchema } from "../validators/chat.validator";

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const result = chatMessageSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: result.error.issues[0]?.message || "Invalid request body",
    });
    return;
  }

  try {
    const response = await handleChatMessage(result.data);
    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === "CHAT_SESSION_NOT_FOUND") {
      res.status(404).json({ message: "Chat session not found" });
      return;
    }

    throw error;
  }
}

export async function getSessionMessages(req: Request, res: Response): Promise<void> {
  const result = chatSessionParamsSchema.safeParse({
    sessionId: req.params.sessionId,
  });

  if (!result.success) {
    res.status(400).json({
      message: result.error.issues[0]?.message || "Invalid session ID",
    });
    return;
  }

  const session = await getChatSessionMessages(result.data.sessionId);

  if (!session) {
    res.status(404).json({
      message: "Chat session not found",
    });
    return;
  }

  res.json({
    status: "ok",
    sessionId: session.sessionId,
    messages: session.messages,
  });
}

export const chatController = {
  sendMessage,
  getSessionMessages,
};
