import { ChatRole, type ChatSession, type ChatMessage } from "@prisma/client";
import { randomUUID } from "crypto";
import prisma from "../lib/prisma";
import {
  searchToyotaKnowledge,
  type ToyotaModelSummary,
} from "./knowledge.service";

type ChatMessageInput = {
  sessionId?: string;
  message: string;
};

type ChatMessageOutput = {
  status: "ok";
  sessionId: string;
  reply: string;
  matchedModels: Array<Pick<ToyotaModelSummary, "slug" | "name">>;
};

function toMatchedModels(models: ToyotaModelSummary[]) {
  return models.slice(0, 3).map((model) => ({
    slug: model.slug,
    name: model.name,
  }));
}

function buildReply(matchedModels: Array<{ name: string }>): string {
  if (matchedModels.length === 0) {
    return "Could you tell me your budget, city, seating requirement, and preferred fuel type?";
  }

  const names = matchedModels.map((model) => model.name);

  if (names.length === 1) {
    return `For your requirement, you may consider Toyota ${names[0]}. To suggest better, please share your budget, city, seating requirement, and preferred fuel type.`;
  }

  if (names.length === 2) {
    return `For your requirement, you may consider Toyota ${names[0]} or ${names[1]}. To suggest better, please share your budget, city, seating requirement, and preferred fuel type.`;
  }

  return `For your requirement, you may consider Toyota ${names[0]}, ${names[1]}, or ${names[2]}. To suggest better, please share your budget, city, seating requirement, and preferred fuel type.`;
}

async function getOrCreateChatSession(sessionId?: string): Promise<ChatSession> {
  if (!sessionId) {
    return prisma.chatSession.create({
      data: {
        sessionId: randomUUID(),
      },
    });
  }

  const existingSession = await prisma.chatSession.findUnique({
    where: { sessionId },
  });

  if (!existingSession) {
    throw new Error("CHAT_SESSION_NOT_FOUND");
  }

  return existingSession;
}

export async function handleChatMessage(input: ChatMessageInput): Promise<ChatMessageOutput> {
  const session = await getOrCreateChatSession(input.sessionId);
  const userMessage = input.message.trim();

  await prisma.chatMessage.create({
    data: {
      chatSessionId: session.id,
      role: ChatRole.USER,
      message: userMessage,
    },
  });

  const matchedModels = searchToyotaKnowledge(userMessage);
  const bestMatches = toMatchedModels(matchedModels);
  const reply = buildReply(bestMatches);

  await prisma.chatMessage.create({
    data: {
      chatSessionId: session.id,
      role: ChatRole.ASSISTANT,
      message: reply,
    },
  });

  return {
    status: "ok",
    sessionId: session.sessionId,
    reply,
    matchedModels: bestMatches,
  };
}

export async function getChatSessionMessages(sessionId: string) {
  const session = await prisma.chatSession.findUnique({
    where: { sessionId },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  return session;
}
