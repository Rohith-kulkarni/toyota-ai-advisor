import { ChatRole, type ChatMessage, type ChatSession } from "@prisma/client";
import { randomUUID } from "crypto";
import { env } from "../config/env";
import prisma from "../lib/prisma";
import {
  cleanChatReply,
  generateToyotaChatReply,
  type ConversationContext,
} from "./ai.service";
import {
  extractToyotaSearchIntent,
  searchToyotaKnowledge,
  type ToyotaModelSearchResult,
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

type ChatMessageContextItem = Pick<ChatMessage, "role" | "message">;

const CONTEXT_CITY_ALIASES = [
  "hyderabad",
  "bangalore",
  "bengaluru",
  "chennai",
  "mumbai",
  "delhi",
  "new delhi",
  "pune",
  "kolkata",
  "ahmedabad",
  "jaipur",
  "kochi",
  "lucknow",
  "surat",
  "indore",
  "visakhapatnam",
  "vizag",
];

function extractCity(text: string): string | null {
  const normalizedText = text.toLowerCase();

  for (const city of CONTEXT_CITY_ALIASES) {
    if (!normalizedText.includes(city)) {
      continue;
    }

    if (city === "bengaluru") {
      return "Bengaluru";
    }

    if (city === "bangalore") {
      return "Bangalore";
    }

    if (city === "new delhi") {
      return "New Delhi";
    }

    if (city === "visakhapatnam" || city === "vizag") {
      return "Visakhapatnam";
    }

    return city.charAt(0).toUpperCase() + city.slice(1);
  }

  return null;
}

function hasExplicitPerformancePowerIntent(text: string): boolean {
  const normalizedText = text.toLowerCase();

  return [
    "performance",
    "power",
    "highway performance",
    "highway",
    "engine performance",
    "sporty",
    "fun to drive",
    "pickup",
    "torque",
    "fast",
    "aggressive look",
    "performance suv",
    "suv power",
  ].some((term) => normalizedText.includes(term));
}

function extractConversationContext(messages: ChatMessageContextItem[]): ConversationContext {
  const userMessages = messages.filter((message) => message.role === ChatRole.USER).slice(-6);

  const context: ConversationContext = {
    budgetMaxLakh: null,
    wantsSportsOrPerformance: false,
    wantsFamily: false,
    wantsSevenSeater: false,
    wantsHybrid: false,
    wantsSUV: false,
    wantsAutomatic: false,
    city: null,
    searchText: "",
  };

  const searchParts: string[] = [];

  for (const message of userMessages) {
    const text = message.message.trim();

    if (!text) {
      continue;
    }

    searchParts.push(text);

    const intent = extractToyotaSearchIntent(text);
    if (intent.budgetLimitLakh !== null) {
      context.budgetMaxLakh = intent.budgetLimitLakh;
    }

    context.wantsSportsOrPerformance = context.wantsSportsOrPerformance || intent.hasSportsPerformanceIntent;
    context.wantsFamily = context.wantsFamily || intent.hasFamilyIntent;
    context.wantsSevenSeater = context.wantsSevenSeater || intent.hasSevenSeaterIntent;
    context.wantsHybrid = context.wantsHybrid || intent.hasHybridIntent;
    context.wantsSUV = context.wantsSUV || intent.hasSuvIntent;
    context.wantsAutomatic = context.wantsAutomatic || intent.hasAutomaticIntent;

    const city = extractCity(text);
    if (city) {
      context.city = city;
    }
  }

  context.searchText = searchParts.join(" ").trim();
  return context;
}

function toMatchedModels(models: ToyotaModelSearchResult[]) {
  return models.slice(0, 3).map((model) => ({
    slug: model.slug,
    name: model.name,
  }));
}

function getStartingPriceLakh(model: ToyotaModelSearchResult): number | null {
  const priceMatch = model.startingPriceRange.match(/(\d+(?:\.\d+)?)/);

  if (!priceMatch) {
    return null;
  }

  const value = Number(priceMatch[1]);

  if (Number.isNaN(value)) {
    return null;
  }

  return /crore|cr/i.test(model.startingPriceRange) ? value * 100 : value;
}

function isMpvLike(model: ToyotaModelSearchResult): boolean {
  return model.category.toLowerCase().includes("mpv");
}

function filterModelsForIntent(
  models: ToyotaModelSearchResult[],
  intent: ReturnType<typeof extractToyotaSearchIntent>,
  context: ConversationContext
): ToyotaModelSearchResult[] {
  if (!intent.hasSportsPerformanceIntent || intent.hasFamilyIntent) {
    return models;
  }

  const budgetLimit = context.budgetMaxLakh ?? intent.budgetLimitLakh;

  return models.filter((model) => {
    const lowerName = model.name.toLowerCase();
    const startingPrice = getStartingPriceLakh(model);
    const isTaisor = lowerName.includes("urban cruiser taisor");
    const isGlanza = lowerName.includes("glanza");
    const isHyryder = lowerName.includes("urban cruiser hyryder");
    const isFortuner = lowerName.includes("fortuner");
    const isLegender = lowerName.includes("legender");

    if (
      lowerName.includes("rumion") ||
      lowerName.includes("innova crysta") ||
      lowerName.includes("innova hycross") ||
      lowerName.includes("vellfire") ||
      lowerName.includes("hilux")
    ) {
      return false;
    }

    if (isMpvLike(model)) {
      return false;
    }

    if (isHyryder && !(intent.hasSuvIntent || intent.hasHybridIntent || context.wantsSUV || context.wantsHybrid)) {
      return false;
    }

    if (budgetLimit !== null && startingPrice !== null && startingPrice > budgetLimit) {
      return false;
    }

    if (budgetLimit !== null && budgetLimit < 30 && (isFortuner || isLegender)) {
      return false;
    }

    if (isFortuner || isLegender) {
      return budgetLimit === null || budgetLimit >= 30;
    }

    return isTaisor || isGlanza || isHyryder || isFortuner || isLegender;
  });
}

function isUnsafeSportsReply(
  reply: string,
  intent: ReturnType<typeof extractToyotaSearchIntent>,
  context: ConversationContext,
  allowOutsideBudgetPerformanceModels: boolean
): boolean {
  if (!intent.hasSportsPerformanceIntent || intent.hasFamilyIntent) {
    return false;
  }

  const lowerReply = reply.toLowerCase();
  const mentionsOutsideBudget =
    lowerReply.includes("outside budget") ||
    lowerReply.includes("outside this budget") ||
    lowerReply.includes("out of budget");

  if (["rumion", "hycross", "crysta", "vellfire", "hilux"].some((name) => lowerReply.includes(name))) {
    return true;
  }

  if (["fortuner", "legender"].some((name) => lowerReply.includes(name))) {
    if (!allowOutsideBudgetPerformanceModels) {
      return true;
    }

    return !mentionsOutsideBudget;
  }

  return false;
}

function getFallbackReason(model: ToyotaModelSearchResult): string {
  const text = [
    model.category,
    ...model.fuelTypes,
    ...model.idealFor,
    ...model.recommendationTags,
    ...model.keyHighlights,
  ]
    .join(" ")
    .toLowerCase();

  if (text.includes("hybrid")) {
    return "Good for hybrid efficiency and family comfort.";
  }

  if (text.includes("7-seater") || text.includes("7 seater") || model.seatingCapacity.includes("7")) {
    return "Good for family use and 7-seat practicality.";
  }

  if (text.includes("suv")) {
    return "Good for SUV styling and city use.";
  }

  if (text.includes("premium") || text.includes("luxury")) {
    return "Good for a more premium feel and comfort.";
  }

  if (text.includes("city") || text.includes("urban")) {
    return "Good for easy city driving.";
  }

  return "Good all-round option for daily use.";
}

function getSportsFallbackReason(model: ToyotaModelSearchResult): string {
  const name = model.name.toLowerCase();
  const category = model.category.toLowerCase();
  const tags = model.recommendationTags.join(" ").toLowerCase();

  if (name.includes("urban cruiser taisor")) {
    return "Good if you want compact SUV styling and city-friendly driving.";
  }

  if (name.includes("glanza")) {
    return "Good if you want a hatchback with a premium feel for daily use.";
  }

  if (name.includes("urban cruiser hyryder")) {
    return "Good if you want a hybrid SUV feel for city and family use.";
  }

  if (name.includes("fortuner") || name.includes("legender")) {
    return "Good if you want a bigger, more stylish SUV feel.";
  }

  if (category.includes("suv") || tags.includes("style-focused")) {
    return "Good if you want sporty styling for city use.";
  }

  return "Good if you want a practical Toyota with a slightly sporty feel.";
}

function buildFallbackReply(
  matchedModels: ToyotaModelSearchResult[],
  intent: ReturnType<typeof extractToyotaSearchIntent>,
  context: ConversationContext,
  allowOutsideBudgetPerformanceModels: boolean
): string {
  if (intent.hasSportsPerformanceIntent && !intent.hasFamilyIntent) {
    const budgetLimit = context.budgetMaxLakh ?? intent.budgetLimitLakh;
    const budgetText = budgetLimit !== null ? `under ₹${budgetLimit} lakh` : "in this budget";
    const sportsModels =
      matchedModels.length > 0
        ? matchedModels
        : [
            {
              slug: "urban-cruiser-taisor",
              name: "Urban Cruiser Taisor",
              category: "Compact SUV",
              startingPriceRange: "",
              fuelTypes: [],
              transmissionOptions: [],
              seatingCapacity: "5",
              idealFor: [],
              recommendationTags: [],
              keyHighlights: [],
              commonCustomerQuestions: [],
            },
            {
              slug: "glanza",
              name: "Glanza",
              category: "Premium hatchback",
              startingPriceRange: "",
              fuelTypes: [],
              transmissionOptions: [],
              seatingCapacity: "5",
              idealFor: [],
              recommendationTags: [],
              keyHighlights: [],
              commonCustomerQuestions: [],
            },
          ];

    const lines = sportsModels.slice(0, 3).map((model, index) => {
      return `${index + 1}. Toyota ${model.name}\n${getSportsFallbackReason(model)}`;
    });

    const outsideBudgetNote =
      allowOutsideBudgetPerformanceModels && budgetLimit !== null && budgetLimit < 30
        ? "Fortuner and Legender are stronger SUVs, but they are outside this budget range."
        : "";

    return [
      `Toyota does not currently have a dedicated sports car in this local catalogue ${budgetText}.`,
      "",
      "If you want a sportier-looking Toyota, you can consider:",
      "",
      ...lines.flatMap((line) => [line, ""]),
      outsideBudgetNote,
      "Pricing depends on variant and city, so please verify current details with the dealership.",
      "",
      "To suggest better, please share:",
      "1. Do you mean sporty looks or performance?",
      "2. Manual or automatic?",
      "3. City",
    ]
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  if (matchedModels.length === 0) {
    return ["Could you share your budget, city, seating requirement, and preferred fuel type?"].join("\n");
  }

  const intro = "For your requirement, you can consider:";
  const modelBlocks = matchedModels.slice(0, 3).map((model, index) => {
    return [`${index + 1}. Toyota ${model.name}`, getFallbackReason(model)].join("\n");
  });
  const disclaimer =
    "Pricing and safety features vary by variant and city, so please verify current details with the dealership.";
  const followUps = [
    "To suggest better, please share:",
    "1. Seating requirement",
    "2. Preferred fuel type",
    "3. City",
  ].join("\n");

  return [intro, "", ...modelBlocks.flatMap((block) => [block, ""]), disclaimer, "", followUps]
    .join("\n")
    .trim();
}

function isGenericGeminiReply(reply: string, matchedModels: ToyotaModelSearchResult[]): boolean {
  const lowerReply = reply.toLowerCase();

  if (!lowerReply) {
    return true;
  }

  if (matchedModels.length === 0) {
    return false;
  }

  if (lowerReply.includes("toyota offers a range") || lowerReply.includes("toyota has a range")) {
    return true;
  }

  const mentionedModel = matchedModels.some((model) => lowerReply.includes(model.name.toLowerCase()));

  return !mentionedModel;
}

async function getRecentChatHistory(sessionId: string): Promise<ChatMessage[]> {
  const messages = await prisma.chatMessage.findMany({
    where: {
      chatSessionId: sessionId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return messages.slice(-10);
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

  const recentChatHistory = await getRecentChatHistory(session.id);
  const conversationContext = extractConversationContext(recentChatHistory);
  const searchText = conversationContext.searchText || userMessage;
  const allowOutsideBudgetPerformanceModels =
    hasExplicitPerformancePowerIntent(userMessage) ||
    hasExplicitPerformancePowerIntent(conversationContext.searchText);
  const matchedModels = searchToyotaKnowledge(searchText);
  const intent = extractToyotaSearchIntent(searchText);
  const recommendedModels = filterModelsForIntent(matchedModels, intent, conversationContext);
  const bestMatches = toMatchedModels(recommendedModels);
  const matchedSummary =
    recommendedModels
      .slice(0, 3)
      .map((model) => `${model.name} (${model.category})`)
      .join(", ") || "No strong model match";

  let reply = buildFallbackReply(
    recommendedModels,
    intent,
    conversationContext,
    allowOutsideBudgetPerformanceModels
  );
  let responseMode: "fallback" | "gemini" = "fallback";

  if (env.aiEnabled && env.aiProvider === "gemini" && recommendedModels.length > 0) {
    try {
      const geminiReply = await generateToyotaChatReply({
        userMessage,
        matchedModels: recommendedModels.slice(0, 5),
        recentChatHistory: recentChatHistory.map((message) => ({
          role: message.role,
          message: message.message,
        })),
        detectedIntent: intent,
        conversationContext,
      });

      if (
        !isGenericGeminiReply(geminiReply, recommendedModels) &&
        !isUnsafeSportsReply(geminiReply, intent, conversationContext, allowOutsideBudgetPerformanceModels)
      ) {
        reply = geminiReply;
        responseMode = "gemini";
      } else {
        console.warn("[chat] Gemini reply was too generic or unsafe, using local fallback");
        reply = buildFallbackReply(
          recommendedModels,
          intent,
          conversationContext,
          allowOutsideBudgetPerformanceModels
        );
      }
    } catch (error) {
      console.warn(
        "[chat] Gemini reply failed, using local Toyota fallback:",
        error instanceof Error ? error.message : "Unknown error"
      );
      reply = buildFallbackReply(
        recommendedModels,
        intent,
        conversationContext,
        allowOutsideBudgetPerformanceModels
      );
    }
  }

  reply = cleanChatReply(reply);

  if (env.nodeEnv === "development") {
    console.info("[chat] reply mode:", responseMode, {
      budgetMaxLakh: conversationContext.budgetMaxLakh,
      detectedIntent: {
        sports: conversationContext.wantsSportsOrPerformance,
        family: conversationContext.wantsFamily,
        sevenSeater: conversationContext.wantsSevenSeater,
        hybrid: conversationContext.wantsHybrid,
        suv: conversationContext.wantsSUV,
        automatic: conversationContext.wantsAutomatic,
        city: conversationContext.city,
      },
      matchedSlugs: recommendedModels.slice(0, 3).map((model) => model.slug),
      matchedSummary,
    });
  }

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
