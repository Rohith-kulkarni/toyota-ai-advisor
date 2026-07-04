import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";
import {
  cleanChatReply,
  type ConversationContext,
} from "./ai.service";
import { searchToyotaKnowledge, type ToyotaModelSearchResult } from "./knowledge.service";

type ChatHistoryItem = {
  role: "USER" | "ASSISTANT" | "SYSTEM";
  message: string;
};

export type ResponsibilityType = "TEST_DRIVE" | "FINANCE" | "GENERAL_CAR_ADVICE";

export type ResponsibilityDetail = {
  detected: boolean;
  missingFields: string[];
  suggestedFields: Record<string, string | boolean>;
  nextQuestion: string;
};

export type ResponsibilityAssistance = {
  detectedResponsibilities: ResponsibilityType[];
  testDrive: ResponsibilityDetail;
  finance: ResponsibilityDetail;
  generalCarAdvice: ResponsibilityDetail;
};

export type ResponsibilityAnalysisInput = {
  latestUserMessage: string;
  recentChatHistory: ChatHistoryItem[];
  matchedModels: Array<Pick<ToyotaModelSearchResult, "name" | "category" | "startingPriceRange">>;
  conversationContext: ConversationContext;
};

export type LeadAiAssistanceInput = {
  lead: {
    name: string | null;
    phone: string | null;
    city: string | null;
    interestedModel: string | null;
    budget: string | null;
    purchaseTimeline: string | null;
    testDriveRequested: boolean;
    preferredTestDriveDate: string | null;
    preferredTestDriveTime: string | null;
    testDriveLocation: string | null;
    financeAssistanceRequested: boolean;
    monthlyIncomeRange: string | null;
    downPaymentBudget: string | null;
    loanTenurePreference: string | null;
    emiBudget: string | null;
    chatSummary: string | null;
    leadScore: number | null;
    leadScoreReason: string | null;
  };
  chatHistory: ChatHistoryItem[];
};

export type LeadAiAssistance = {
  leadSummary: string;
  testDriveGuidance: string;
  financeGuidance: string;
  nextBestActions: string[];
  suggestedCallScript: string;
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

function hasGeminiEnabled(): boolean {
  return env.aiEnabled && env.aiProvider === "gemini" && Boolean(env.geminiApiKey);
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function collectConversationText(history: ChatHistoryItem[], latestUserMessage: string): string {
  const userMessages = history
    .filter((message) => message.role === "USER")
    .slice(-6)
    .map((message) => message.message.trim())
    .filter(Boolean);

  return [...userMessages, latestUserMessage.trim()].filter(Boolean).join(" ").toLowerCase();
}

function detectKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function getLatestUserMessage(history: ChatHistoryItem[], latestUserMessage: string): string {
  const latestHistoryUserMessage = [...history]
    .reverse()
    .find((message) => message.role === "USER" && message.message.trim());

  return latestUserMessage.trim() || latestHistoryUserMessage?.message.trim() || "";
}

function formatMatchedModels(models: Array<Pick<ToyotaModelSearchResult, "name" | "category" | "startingPriceRange">>): string {
  if (models.length === 0) {
    return "No strong Toyota model match.";
  }

  return models
    .slice(0, 5)
    .map((model) => `- ${model.name} (${model.category}) - ${model.startingPriceRange}`)
    .join("\n");
}

function extractAssistantQuestion(fields: string[], defaults: string[]): string {
  if (fields.length === 0) {
    return defaults.join(" ");
  }

  if (fields.includes("preferredTestDriveDate") || fields.includes("preferredTestDriveTime")) {
    return "Which date and time would you prefer for the test drive?";
  }

  if (fields.includes("testDriveLocation")) {
    return "Which city or showroom should we use for the test drive?";
  }

  if (
    fields.includes("downPaymentBudget") ||
    fields.includes("loanTenurePreference") ||
    fields.includes("emiBudget")
  ) {
    return "What down payment and EMI range are you comfortable with?";
  }

  if (fields.includes("monthlyIncomeRange")) {
    return "What monthly income range should I note for finance guidance?";
  }

  return defaults.join(" ");
}

function buildTestDriveDetail(input: ResponsibilityAnalysisInput, conversationText: string): ResponsibilityDetail {
  const detected = detectKeyword(conversationText, [
    "test drive",
    "book test drive",
    "book a test drive",
    "drive",
    "showroom visit",
    "visit showroom",
    "schedule test",
  ]);

  const city = input.conversationContext.city?.trim() || "";
  const suggestedFields: Record<string, string | boolean> = {};
  const missingFields: string[] = [];

  if (detected) {
    suggestedFields.testDriveRequested = true;

    const firstModel = input.matchedModels[0]?.name;
    if (firstModel) {
      suggestedFields.interestedModel = firstModel;
    }

    if (city) {
      suggestedFields.testDriveLocation = city;
    } else {
      missingFields.push("testDriveLocation");
    }

    missingFields.push("preferredTestDriveDate", "preferredTestDriveTime");
  }

  return {
    detected,
    missingFields: uniqueStrings(missingFields),
    suggestedFields,
    nextQuestion: detected
      ? extractAssistantQuestion(uniqueStrings(missingFields), ["Which date and time would you prefer for the test drive?"])
      : "",
  };
}

function buildFinanceDetail(input: ResponsibilityAnalysisInput, conversationText: string): ResponsibilityDetail {
  const detected = detectKeyword(conversationText, [
    "finance",
    "emi",
    "loan",
    "down payment",
    "tenure",
    "monthly payment",
    "installment",
    "exchange",
    "quotation",
  ]);

  const suggestedFields: Record<string, string | boolean> = {};
  const missingFields: string[] = [];

  if (detected) {
    suggestedFields.financeAssistanceRequested = true;

    if (input.conversationContext.searchText.includes("income")) {
      missingFields.push("monthlyIncomeRange");
    }

    missingFields.push("downPaymentBudget", "loanTenurePreference", "emiBudget");
  }

  return {
    detected,
    missingFields: uniqueStrings(missingFields),
    suggestedFields,
    nextQuestion: detected
      ? extractAssistantQuestion(uniqueStrings(missingFields), ["What down payment and EMI range are you comfortable with?"])
      : "",
  };
}

function buildGeneralAdviceDetail(input: ResponsibilityAnalysisInput): ResponsibilityDetail {
  const detected =
    input.matchedModels.length > 0 ||
    !input.conversationContext.searchText.trim() ||
    input.conversationContext.wantsSportsOrPerformance ||
    input.conversationContext.wantsFamily ||
    input.conversationContext.wantsSevenSeater ||
    input.conversationContext.wantsHybrid ||
    input.conversationContext.wantsSUV ||
    input.conversationContext.wantsAutomatic;

  return {
    detected,
    missingFields: detected ? [] : ["budget", "city", "seating requirement", "preferred fuel type"],
    suggestedFields: {},
    nextQuestion: detected
      ? "If you'd like model advice, please share your budget, city, seating requirement, and preferred fuel type."
      : "",
  };
}

function buildRuleBasedAnalysis(input: ResponsibilityAnalysisInput): ResponsibilityAssistance {
  const conversationText = collectConversationText(input.recentChatHistory, input.latestUserMessage);
  const testDrive = buildTestDriveDetail(input, conversationText);
  const finance = buildFinanceDetail(input, conversationText);
  const generalCarAdvice = buildGeneralAdviceDetail(input);

  const detectedResponsibilities: ResponsibilityType[] = [];

  if (testDrive.detected) {
    detectedResponsibilities.push("TEST_DRIVE");
  }

  if (finance.detected) {
    detectedResponsibilities.push("FINANCE");
  }

  if (generalCarAdvice.detected && detectedResponsibilities.length === 0) {
    detectedResponsibilities.push("GENERAL_CAR_ADVICE");
  } else if (generalCarAdvice.detected && detectedResponsibilities.length > 0) {
    detectedResponsibilities.push("GENERAL_CAR_ADVICE");
  }

  return {
    detectedResponsibilities,
    testDrive,
    finance,
    generalCarAdvice,
  };
}

function stripJsonCodeFence(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function safeJsonParse<T>(text: string): T | null {
  const trimmed = stripJsonCodeFence(text);
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  try {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as T;
  } catch {
    return null;
  }
}

function buildResponsibilityPrompt(input: ResponsibilityAnalysisInput, fallback: ResponsibilityAssistance): string {
  return [
    "You are a strict JSON generator for Toyota dealership responsibility analysis.",
    "Return JSON only. No markdown. No code fences.",
    "Use the following schema exactly:",
    "{",
    '  "detectedResponsibilities": ["TEST_DRIVE", "FINANCE", "GENERAL_CAR_ADVICE"],',
    '  "testDrive": {',
    '    "detected": true,',
    '    "missingFields": ["preferredTestDriveDate"],',
    '    "suggestedFields": {"testDriveRequested": true},',
    '    "nextQuestion": "Which date and time would you prefer for the test drive?"',
    "  },",
    '  "finance": {',
    '    "detected": true,',
    '    "missingFields": ["downPaymentBudget"],',
    '    "suggestedFields": {"financeAssistanceRequested": true},',
    '    "nextQuestion": "What down payment and EMI range are you comfortable with?"',
    "  },",
    '  "generalCarAdvice": {',
    '    "detected": true,',
    '    "missingFields": [],',
    '    "suggestedFields": {},',
    '    "nextQuestion": "If you\'d like model advice, please share your budget, city, seating requirement, and preferred fuel type."',
    "  }",
    "}",
    "",
    "Rules:",
    "- Keep detectedResponsibilities unique.",
    "- If no test drive intent is present, set testDrive.detected to false and leave missingFields empty.",
    "- If no finance intent is present, set finance.detected to false and leave missingFields empty.",
    "- Include GENERAL_CAR_ADVICE when the user is asking about car options or when no responsibility-specific intent exists.",
    "- Use the latest message, recent history, matched Toyota models, and conversation context.",
    "- Ask for missing fields only; do not promise booking or loan approval.",
    "- Keep nextQuestion short and helpful.",
    "",
    "Latest message:",
    input.latestUserMessage,
    "",
    "Recent chat history:",
    input.recentChatHistory.map((message) => `${message.role}: ${message.message}`).join("\n"),
    "",
    "Matched Toyota models:",
    formatMatchedModels(input.matchedModels),
    "",
    "Conversation context:",
    `City: ${input.conversationContext.city ?? "not detected"}`,
    `Search text: ${input.conversationContext.searchText || "not available"}`,
    `Budget limit: ${input.conversationContext.budgetMaxLakh !== null ? `under ${input.conversationContext.budgetMaxLakh} lakh` : "not detected"}`,
    `Sports/performance: ${input.conversationContext.wantsSportsOrPerformance ? "yes" : "no"}`,
    `Family: ${input.conversationContext.wantsFamily ? "yes" : "no"}`,
    `7-seater: ${input.conversationContext.wantsSevenSeater ? "yes" : "no"}`,
    `Hybrid: ${input.conversationContext.wantsHybrid ? "yes" : "no"}`,
    `SUV: ${input.conversationContext.wantsSUV ? "yes" : "no"}`,
    `Automatic: ${input.conversationContext.wantsAutomatic ? "yes" : "no"}`,
    "",
    "Baseline JSON to preserve if helpful:",
    JSON.stringify(fallback),
  ].join("\n");
}

async function tryGeminiResponsibilityAnalysis(
  input: ResponsibilityAnalysisInput,
  fallback: ResponsibilityAssistance
): Promise<ResponsibilityAssistance | null> {
  if (!hasGeminiEnabled()) {
    return null;
  }

  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: env.geminiModel,
    contents: buildResponsibilityPrompt(input, fallback),
    config: {
      systemInstruction:
        "You analyse dealership assistance intents and return valid JSON that can be parsed without any extra text.",
      temperature: 0.2,
    },
  });

  const parsed = safeJsonParse<ResponsibilityAssistance>(response.text ?? "");

  if (!parsed) {
    return null;
  }

  return parsed;
}

function buildLeadSummary(input: LeadAiAssistanceInput, analysis: ResponsibilityAssistance): string {
  const lead = input.lead;
  const parts = [
    lead.name?.trim() || "Customer",
    lead.city?.trim() ? `from ${lead.city.trim()}` : "from an unknown city",
    lead.interestedModel?.trim() ? `interested in ${lead.interestedModel.trim()}` : "without a model specified",
    lead.budget?.trim() ? `budget ${lead.budget.trim()}` : "without a budget shared",
  ];

  if (lead.testDriveRequested || analysis.testDrive.detected) {
    parts.push("test drive interest");
  }

  if (lead.financeAssistanceRequested || analysis.finance.detected) {
    parts.push("finance interest");
  }

  if (lead.purchaseTimeline?.trim()) {
    parts.push(`timeline ${lead.purchaseTimeline.trim()}`);
  }

  return `${parts.join(", ")}.`;
}

function buildRuleBasedLeadAssistance(
  input: LeadAiAssistanceInput,
  analysis: ResponsibilityAssistance
): LeadAiAssistance {
  const lead = input.lead;
  const leadSummary = buildLeadSummary(input, analysis);

  const testDriveGuidance = analysis.testDrive.detected
    ? [
        "Customer appears interested in a test drive.",
        analysis.testDrive.nextQuestion || "Confirm preferred date, time, and showroom.",
        "Do not confirm a booking until the dealership team verifies availability.",
      ].join(" ")
    : "No test drive request detected yet.";

  const financeGuidance = analysis.finance.detected
    ? [
        "Customer appears interested in finance or EMI assistance.",
        analysis.finance.nextQuestion || "Confirm down payment, tenure, and EMI comfort.",
        "Finance details must be verified by the dealership or finance team.",
        "Do not promise loan approval or an exact EMI.",
      ].join(" ")
    : "No finance request detected yet.";

  const nextBestActions = uniqueStrings([
    lead.testDriveRequested || analysis.testDrive.detected
      ? "Call customer and confirm preferred test drive date"
      : "",
    lead.financeAssistanceRequested || analysis.finance.detected
      ? "Ask for down payment and EMI comfort"
      : "",
    "Share variant-wise pricing after verification",
  ]);

  const suggestedCallScript = cleanChatReply(
    [
      `Hi ${lead.name?.trim() || "customer"}, this is Toyota Advisor.`,
      lead.testDriveRequested || analysis.testDrive.detected
        ? "I wanted to confirm your preferred test drive date, time, and showroom."
        : "I wanted to check if you would like a test drive.",
      lead.financeAssistanceRequested || analysis.finance.detected
        ? "I can also note your down payment and EMI comfort so our finance team can verify the details."
        : "If finance support is needed, please share your down payment and EMI comfort.",
      "We will verify all details with the dealership team before confirming anything.",
    ].join(" ")
  );

  return {
    leadSummary,
    testDriveGuidance,
    financeGuidance,
    nextBestActions,
    suggestedCallScript,
  };
}

async function tryGeminiLeadAssistance(
  input: LeadAiAssistanceInput,
  analysis: ResponsibilityAssistance,
  fallback: LeadAiAssistance
): Promise<LeadAiAssistance | null> {
  if (!hasGeminiEnabled()) {
    return null;
  }

  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: env.geminiModel,
    contents: [
      "You are helping a Toyota dealership staff member prepare next actions for a lead.",
      "Return JSON only, no markdown or commentary.",
      "Use this schema exactly:",
      "{",
      '  "leadSummary": "string",',
      '  "testDriveGuidance": "string",',
      '  "financeGuidance": "string",',
      '  "nextBestActions": ["string"],',
      '  "suggestedCallScript": "string"',
      "}",
      "",
      "Lead data:",
      JSON.stringify(input.lead),
      "",
      "Chat history:",
      input.chatHistory.map((message) => `${message.role}: ${message.message}`).join("\n"),
      "",
      "Responsibility analysis:",
      JSON.stringify(analysis),
      "",
      "Baseline JSON to preserve if helpful:",
      JSON.stringify(fallback),
    ].join("\n"),
    config: {
      systemInstruction:
        "You produce concise dealership-ready assistance for the sales team and never mention unsupported promises.",
      temperature: 0.3,
    },
  });

  const parsed = safeJsonParse<LeadAiAssistance>(response.text ?? "");

  if (!parsed) {
    return null;
  }

  return {
    leadSummary: cleanChatReply(parsed.leadSummary),
    testDriveGuidance: cleanChatReply(parsed.testDriveGuidance),
    financeGuidance: cleanChatReply(parsed.financeGuidance),
    nextBestActions: uniqueStrings(parsed.nextBestActions ?? []).slice(0, 5),
    suggestedCallScript: cleanChatReply(parsed.suggestedCallScript),
  };
}

export async function analyzeResponsibilityIntent(
  input: ResponsibilityAnalysisInput
): Promise<ResponsibilityAssistance> {
  const fallback = buildRuleBasedAnalysis(input);
  const geminiResult = await tryGeminiResponsibilityAnalysis(input, fallback);

  return geminiResult ?? fallback;
}

export async function generateLeadAiAssistance(
  input: LeadAiAssistanceInput
): Promise<LeadAiAssistance> {
  const latestUserMessage = input.chatHistory
    .slice()
    .reverse()
    .find((message) => message.role === "USER" && message.message.trim())?.message.trim() ?? "";

  const matchedModels = searchToyotaKnowledge(
    input.chatHistory
      .filter((message) => message.role === "USER")
      .map((message) => message.message)
      .join(" ")
  ).slice(0, 5);

  const conversationContext: ConversationContext = {
    budgetMaxLakh: null,
    wantsSportsOrPerformance: false,
    wantsFamily: false,
    wantsSevenSeater: false,
    wantsHybrid: false,
    wantsSUV: false,
    wantsAutomatic: false,
    city: input.lead.city?.trim() || null,
    searchText: input.chatHistory.map((message) => message.message).join(" ").trim(),
  };

  const analysis = await analyzeResponsibilityIntent({
    latestUserMessage,
    recentChatHistory: input.chatHistory,
    matchedModels,
    conversationContext,
  });

  const fallback = buildRuleBasedLeadAssistance(input, analysis);
  const geminiResult = await tryGeminiLeadAssistance(input, analysis, fallback);

  return geminiResult ?? fallback;
}
