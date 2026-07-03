import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import type { ToyotaModelSearchResult, ToyotaSearchIntent } from "./knowledge.service";

type ChatHistoryItem = {
  role: "USER" | "ASSISTANT" | "SYSTEM";
  message: string;
};

export type ConversationContext = {
  budgetMaxLakh: number | null;
  wantsSportsOrPerformance: boolean;
  wantsFamily: boolean;
  wantsSevenSeater: boolean;
  wantsHybrid: boolean;
  wantsSUV: boolean;
  wantsAutomatic: boolean;
  city: string | null;
  searchText: string;
};

type GenerateToyotaReplyInput = {
  userMessage: string;
  matchedModels: ToyotaModelSearchResult[];
  recentChatHistory: ChatHistoryItem[];
  detectedIntent: ToyotaSearchIntent;
  conversationContext: ConversationContext;
};

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!env.geminiApiKey) {
    throw new Error("Missing Gemini API key");
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: env.geminiApiKey,
    });
  }

  return geminiClient;
}

function formatModels(models: ToyotaModelSearchResult[]): string {
  if (models.length === 0) {
    return "No direct Toyota model matches were found.";
  }

  return models
    .map(
      (model) =>
        [
          `- ${model.name} (${model.category})`,
          `  Starting price: ${model.startingPriceRange}`,
          `  Fuel types: ${model.fuelTypes.join(", ")}`,
          `  Transmissions: ${model.transmissionOptions.join(", ")}`,
          `  Seating: ${model.seatingCapacity}`,
          `  Best for: ${model.idealFor.join(", ")}`,
          `  Highlights: ${model.keyHighlights.join(" | ")}`,
          `  Common questions: ${model.commonCustomerQuestions.join(" | ")}`,
          `  Tags: ${model.recommendationTags.join(", ")}`,
        ].join("\n")
    )
    .join("\n\n");
}

function formatHistory(history: ChatHistoryItem[]): string {
  if (history.length === 0) {
    return "No previous chat history.";
  }

  return history.map((item) => `${item.role}: ${item.message}`).join("\n");
}

function formatConversationContext(context: ConversationContext): string {
  const lines = [
    `Budget limit: ${context.budgetMaxLakh !== null ? `under ${context.budgetMaxLakh} lakh` : "not detected"}`,
    `Sports/performance intent: ${context.wantsSportsOrPerformance ? "yes" : "no"}`,
    `Family intent: ${context.wantsFamily ? "yes" : "no"}`,
    `7-seater intent: ${context.wantsSevenSeater ? "yes" : "no"}`,
    `Hybrid intent: ${context.wantsHybrid ? "yes" : "no"}`,
    `SUV intent: ${context.wantsSUV ? "yes" : "no"}`,
    `Automatic intent: ${context.wantsAutomatic ? "yes" : "no"}`,
    `City: ${context.city ?? "not detected"}`,
    `Conversation search text: ${context.searchText || "not available"}`,
  ];

  return lines.join("\n");
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

function buildSystemInstruction(): string {
  return [
    "You are a helpful Toyota dealership assistant.",
    "Help users choose Toyota cars using only the Toyota knowledge provided in the prompt.",
    "Do not invent exact prices, discounts, offers, finance approvals, availability, delivery timelines, or on-road prices.",
    "When mentioning prices, say they should be verified with the dealership.",
    "Keep replies short, friendly, and helpful.",
    "Ask useful follow-up questions about budget, city, seating requirement, preferred fuel type, and purchase timeline when needed.",
    "Encourage the user to submit their details for a dealership callback when appropriate.",
    "If asked about non-Toyota topics, politely steer back to Toyota vehicle assistance.",
    "Never mention information that is not supported by the provided Toyota knowledge or the user's message.",
  ].join(" ");
}

function buildPrompt(input: GenerateToyotaReplyInput): string {
  return [
    "Important response rules:",
    "- Return plain text only.",
    "- Return plain text with line breaks.",
    "- Do not return one large paragraph.",
    "- Put every numbered model on a new line.",
    "- Put each reason on the next line.",
    "- Use blank lines between sections.",
    "- Do not use Markdown symbols like *, **, #, or tables.",
    "- Always recommend 1 to 3 specific Toyota models from the provided local knowledge when there is enough information.",
    "- Do not answer with generic lines like 'Toyota offers a range of vehicles' unless no relevant model is found.",
    "- Explain briefly why each recommended model fits.",
    "- Ask maximum 3 follow-up questions.",
    "- Keep the response under 120 words when possible.",
    "- Keep the response short, dealership-friendly, and easy to read in a chat bubble.",
    "- Encourage lead submission naturally, but do not make it the entire answer.",
    "- Use only the provided Toyota knowledge.",
    "- Never invent discounts, finance approval, stock, delivery timelines, or exact on-road price.",
    "- Mention price verification only once.",
    "- Avoid exact starting prices unless they are already in the local knowledge. Prefer phrasing like pricing depends on variant and city.",
    "- Do not claim all safety features. Say safety features vary by variant and should be verified with the dealership.",
    "- For budget queries, avoid recommending a model as definitely under budget unless local knowledge supports it.",
    "- If a model may exceed the budget in some variants, say depending on variant.",
    "- Do not force recommendations when Toyota does not have a suitable match.",
    "- Be honest when a dedicated sports or performance model is not present in the provided local knowledge.",
    "- Suggest closest alternatives only after clarifying they are alternatives, not true sports cars.",
    "- Always respect budget and constraints from recent chat history.",
    "- Do not ignore previous budget when the latest message is short.",
    "- If a model is outside the user's budget, do not recommend it as a fit.",
    "- You may mention outside-budget models only as outside budget.",
    "- If the latest message is a short follow-up like performance, automatic, hybrid, 7 seater, petrol, manual, or city use, use the conversation context to preserve the earlier budget, seating, fuel, body type, and city constraints.",
    "- Only mention Fortuner or Legender as outside-budget examples when the latest user message explicitly asks about performance, power, highway performance, or SUV power.",
    "- If the user only says sports car under a budget, keep the response focused on the closest under-budget sporty alternatives and do not mention Fortuner or Legender.",
    "",
    `Latest message has explicit performance intent: ${hasExplicitPerformancePowerIntent(input.userMessage) ? "yes" : "no"}`,
    `Detected intent: ${input.detectedIntent.keywords.length > 0 ? input.detectedIntent.keywords.join(", ") : "none"}`,
    input.detectedIntent.budgetLimitLakh !== null
      ? `Budget limit: under ${input.detectedIntent.budgetLimitLakh} lakh`
      : "Budget limit: not detected",
    "Conversation context:",
    formatConversationContext(input.conversationContext),
    "",
    "User message:",
    input.userMessage,
    "",
    "Recent chat history:",
    formatHistory(input.recentChatHistory),
    "",
    "Matched Toyota knowledge:",
    formatModels(input.matchedModels),
    "",
    "Write a concise answer that starts with the best Toyota model recommendations if any are available.",
    "Use this style when enough information is available:",
    "",
    "For a family car under ₹15 lakh, you can consider:",
    "",
    "1. Toyota Rumion",
    "Good if you need a practical 7-seater family MPV.",
    "",
    "2. Toyota Urban Cruiser Taisor",
    "Good if you want compact SUV styling for city use.",
    "",
    "3. Toyota Glanza",
    "Good if you want a simple city-friendly family car.",
    "",
    "Pricing and safety features vary by variant and city, so please verify current details with the dealership.",
    "",
    "To suggest better, please share:",
    "1. Seating requirement",
    "2. Preferred fuel type",
    "3. City",
    "",
    "If the user asks for a true sports or performance car and Toyota does not have one in the provided local knowledge, say that clearly first and then offer only close alternatives as alternatives.",
  ].join("\n");
}

export function cleanChatReply(text: string): string {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\u2022/g, "")
    .replace(/\t/g, " ");

  const expandedInlineLists = normalized
    .replace(/\s+(?=\d+\.\s)/g, "\n")
    .replace(/(\d+\.\s*[^:\n]+):\s*/g, "$1\n");

  const lines = expandedInlineLists.split("\n");
  const cleanedLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+/g, " ").trim();

    if (!line) {
      if (cleanedLines[cleanedLines.length - 1] !== "") {
        cleanedLines.push("");
      }
      continue;
    }

    cleanedLines.push(line);
  }

  return cleanedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function generateToyotaChatReply(input: GenerateToyotaReplyInput): Promise<string> {
  const client = getGeminiClient();
  const prompt = buildPrompt(input);

  const response = await client.models.generateContent({
    model: env.geminiModel,
    contents: prompt,
    config: {
      systemInstruction: buildSystemInstruction(),
      temperature: 0.4,
    },
  });

  const reply = response.text?.trim() ?? "";

  if (!reply) {
    throw new Error("Gemini returned an empty response");
  }

  return cleanChatReply(reply);
}
