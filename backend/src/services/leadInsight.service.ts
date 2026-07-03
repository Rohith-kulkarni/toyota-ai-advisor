type InsightChatMessage = {
  message: string;
};

type InsightChatSession = {
  messages: InsightChatMessage[];
};

export type LeadInsightSource = {
  name: string | null;
  phone: string | null;
  city: string | null;
  interestedModel: string | null;
  budget: string | null;
  purchaseTimeline: string | null;
  chatSessions: InsightChatSession[];
};

export type LeadInsightResult = {
  chatSummary: string;
  leadScore: number;
  leadScoreReason: string;
};

const INTENT_KEYWORDS = [
  "buy",
  "book",
  "test drive",
  "quotation",
  "quote",
  "price",
  "finance",
  "exchange",
];

function collectChatText(lead: LeadInsightSource): string {
  return lead.chatSessions
    .flatMap((session) => session.messages)
    .map((message) => message.message)
    .join(" ")
    .toLowerCase();
}

function formatKeywordList(keywords: string[]): string {
  if (keywords.length <= 1) {
    return keywords[0] ?? "";
  }

  if (keywords.length === 2) {
    return `${keywords[0]} and ${keywords[1]}`;
  }

  return `${keywords.slice(0, -1).join(", ")}, and ${keywords[keywords.length - 1]}`;
}

export function generateLeadInsights(lead: LeadInsightSource): LeadInsightResult {
  const chatText = collectChatText(lead);
  const matchedKeywords = INTENT_KEYWORDS.filter((keyword) => chatText.includes(keyword));
  const intentScore = Math.min(matchedKeywords.length * 5, 20);

  let leadScore = 0;
  const scoreParts: string[] = [];

  if (lead.phone?.trim()) {
    leadScore += 25;
    scoreParts.push("phone provided (+25)");
  }

  if (lead.interestedModel?.trim()) {
    leadScore += 15;
    scoreParts.push("interested model shared (+15)");
  }

  if (lead.budget?.trim()) {
    leadScore += 15;
    scoreParts.push("budget shared (+15)");
  }

  if (lead.purchaseTimeline?.trim()) {
    leadScore += 15;
    scoreParts.push("purchase timeline shared (+15)");
  }

  if (lead.city?.trim()) {
    leadScore += 10;
    scoreParts.push("city shared (+10)");
  }

  if (intentScore > 0) {
    leadScore += intentScore;
    scoreParts.push(`intent keywords matched (${formatKeywordList(matchedKeywords)}) (+${intentScore})`);
  } else {
    scoreParts.push("no strong intent keywords matched (+0)");
  }

  leadScore = Math.min(leadScore, 100);

  const cityText = lead.city?.trim() ? `from ${lead.city.trim()}` : "from an unknown city";
  const nameText = lead.name?.trim() ? `${lead.name.trim()} ` : "Customer ";
  const modelText = lead.interestedModel?.trim()
    ? `is interested in ${lead.interestedModel.trim()}`
    : "has not shared a preferred model yet";
  const budgetText = lead.budget?.trim()
    ? `with a budget of ${lead.budget.trim()}`
    : "with no budget shared yet";
  const timelineText = lead.purchaseTimeline?.trim()
    ? `and wants to purchase ${lead.purchaseTimeline.trim()}`
    : "and has not shared a purchase timeline yet";
  const intentText = matchedKeywords.length
    ? `Chat indicates strong intent through keywords like ${formatKeywordList(matchedKeywords)}.`
    : "Chat does not yet show strong purchase intent.";

  const chatSummary = `${nameText}${cityText} ${modelText} ${budgetText} ${timelineText}. ${intentText}`;

  return {
    chatSummary,
    leadScore,
    leadScoreReason: `Score based on ${scoreParts.join("; ")}.`,
  };
}
