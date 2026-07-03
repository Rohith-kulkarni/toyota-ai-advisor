import { toyotaKnowledge, type ToyotaModelKnowledge } from "../data/toyotaKnowledge";

export type ToyotaModelSummary = Pick<
  ToyotaModelKnowledge,
  | "slug"
  | "name"
  | "category"
  | "startingPriceRange"
  | "fuelTypes"
  | "seatingCapacity"
  | "idealFor"
  | "recommendationTags"
>;

export type ToyotaModelSearchResult = ToyotaModelSummary & Pick<
  ToyotaModelKnowledge,
  "transmissionOptions" | "keyHighlights" | "commonCustomerQuestions"
>;

export type ToyotaSearchIntent = {
  rawQuery: string;
  normalizedQuery: string;
  keywords: string[];
  budgetLimitLakh: number | null;
  hasFamilyIntent: boolean;
  hasHybridIntent: boolean;
  hasSuvIntent: boolean;
  hasMpvIntent: boolean;
  hasAutomaticIntent: boolean;
  hasCityIntent: boolean;
  hasPremiumIntent: boolean;
  hasMileageIntent: boolean;
  hasSevenSeaterIntent: boolean;
  hasSportsPerformanceIntent: boolean;
};

function toSummary(model: ToyotaModelKnowledge): ToyotaModelSummary {
  return {
    slug: model.slug,
    name: model.name,
    category: model.category,
    startingPriceRange: model.startingPriceRange,
    fuelTypes: model.fuelTypes,
    seatingCapacity: model.seatingCapacity,
    idealFor: model.idealFor,
    recommendationTags: model.recommendationTags,
  };
}

function toSearchResult(model: ToyotaModelKnowledge): ToyotaModelSearchResult {
  return {
    ...toSummary(model),
    transmissionOptions: model.transmissionOptions,
    keyHighlights: model.keyHighlights,
    commonCustomerQuestions: model.commonCustomerQuestions,
  };
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function buildSearchText(model: ToyotaModelKnowledge): string {
  return [
    model.name,
    model.category,
    model.startingPriceRange,
    ...model.fuelTypes,
    ...model.transmissionOptions,
    model.seatingCapacity,
    ...model.idealFor,
    ...model.keyHighlights,
    ...model.commonCustomerQuestions,
    ...model.recommendationTags,
  ]
    .join(" ")
    .toLowerCase();
}

function tokenize(value: string): string[] {
  return value
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function extractBudgetLimitLakh(query: string): number | null {
  const normalizedQuery = normalize(query);
  const rangeMatch = normalizedQuery.match(
    /(under|below|within|upto|up to)\s*(?:approx\.?\s*)?₹?\s*(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lakhs)?/
  );

  if (rangeMatch) {
    const value = Number(rangeMatch[2]);
    const unit = rangeMatch[3];

    if (Number.isNaN(value)) {
      return null;
    }

    if (unit === "crore" || unit === "cr") {
      return value * 100;
    }

    return value;
  }

  const singleValueMatch = normalizedQuery.match(/₹?\s*(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lakhs)?/);

  if (!singleValueMatch) {
    return null;
  }

  const value = Number(singleValueMatch[1]);
  const unit = singleValueMatch[2];

  if (Number.isNaN(value)) {
    return null;
  }

  if (unit === "crore" || unit === "cr") {
    return value * 100;
  }

  return value;
}

function parseModelStartingPriceLakh(model: ToyotaModelKnowledge): number | null {
  const priceMatch = model.startingPriceRange.match(/(\d+(?:\.\d+)?)/);

  if (!priceMatch) {
    return null;
  }

  const value = Number(priceMatch[1]);

  if (Number.isNaN(value)) {
    return null;
  }

  const hasCrore = /crore|cr|crores/i.test(model.startingPriceRange);
  return hasCrore ? value * 100 : value;
}

function hasAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

function buildIntentKeywords(query: string): string[] {
  const normalizedQuery = normalize(query);
  const tokens = tokenize(normalizedQuery);
  const keywords: string[] = [];

  const push = (label: string, condition: boolean) => {
    if (condition && !keywords.includes(label)) {
      keywords.push(label);
    }
  };

  push("hybrid", hasAny(normalizedQuery, ["hybrid", "strong hybrid"]));
  push("family", hasAny(normalizedQuery, ["family", "family car"]));
  push("7 seater", hasAny(normalizedQuery, ["7 seater", "7-seater", "7 seater car"]));
  push("suv", tokens.includes("suv"));
  push("mpv", tokens.includes("mpv"));
  push("automatic", hasAny(normalizedQuery, ["automatic", "auto"]));
  push("city", hasAny(normalizedQuery, ["city", "urban"]));
  push("premium", hasAny(normalizedQuery, ["premium", "luxury", "flagship"]));
  push("mileage", hasAny(normalizedQuery, ["mileage", "fuel efficiency", "efficient"]));
  push(
    "sports/performance",
    hasAny(normalizedQuery, [
      "sports car",
      "sport car",
      "sporty",
      "performance",
      "fast",
      "fun to drive",
      "stylish",
      "aggressive look",
      "sports",
    ])
  );

  const budgetLimitLakh = extractBudgetLimitLakh(normalizedQuery);
  if (budgetLimitLakh !== null) {
    keywords.push(`under ${budgetLimitLakh} lakh`);
  }

  return keywords;
}

export function extractToyotaSearchIntent(query: string): ToyotaSearchIntent {
  const normalizedQuery = normalize(query);
  const budgetLimitLakh = extractBudgetLimitLakh(normalizedQuery);

  return {
    rawQuery: query,
    normalizedQuery,
    keywords: buildIntentKeywords(query),
    budgetLimitLakh,
    hasFamilyIntent: hasAny(normalizedQuery, ["family", "family car"]),
    hasHybridIntent: hasAny(normalizedQuery, ["hybrid", "strong hybrid"]),
    hasSuvIntent: normalizedQuery.includes("suv"),
    hasMpvIntent: normalizedQuery.includes("mpv"),
    hasAutomaticIntent: hasAny(normalizedQuery, ["automatic", "auto"]),
    hasCityIntent: hasAny(normalizedQuery, ["city", "urban"]),
    hasPremiumIntent: hasAny(normalizedQuery, ["premium", "luxury", "flagship"]),
    hasMileageIntent: hasAny(normalizedQuery, ["mileage", "fuel efficiency", "efficient"]),
    hasSevenSeaterIntent: hasAny(normalizedQuery, ["7 seater", "7-seater", "7 seater car"]),
    hasSportsPerformanceIntent: hasAny(normalizedQuery, [
      "sports car",
      "sport car",
      "sporty",
      "performance",
      "fast",
      "fun to drive",
      "stylish",
      "aggressive look",
      "sports",
    ]),
  };
}

function scoreModel(model: ToyotaModelKnowledge, intent: ToyotaSearchIntent): number {
  const searchText = buildSearchText(model);
  const tokens = tokenize(intent.normalizedQuery).filter((token) => token.length > 2);
  const uniqueTokenMatches = new Set(tokens.filter((token) => searchText.includes(token)));

  let score = 0;

  if (uniqueTokenMatches.size > 0) {
    score += Math.min(uniqueTokenMatches.size * 2, 12);
  }

  if (intent.hasHybridIntent && hasAny(searchText, ["hybrid"])) {
    score += 28;
  }

  if (intent.hasFamilyIntent) {
    if (hasAny(searchText, ["family", "families", "people mover", "family use", "family travel"])) {
      score += 18;
    } else if (model.category.toLowerCase().includes("suv") || model.category.toLowerCase().includes("mpv")) {
      score += 8;
    }
  }

  if (intent.hasSevenSeaterIntent && model.seatingCapacity.includes("7")) {
    score += 15;
  }

  if (intent.hasSuvIntent && model.category.toLowerCase().includes("suv")) {
    score += 16;
  }

  if (intent.hasMpvIntent && model.category.toLowerCase().includes("mpv")) {
    score += 16;
  }

  if (intent.hasAutomaticIntent && hasAny(searchText, ["automatic", "amt", "e-cvt"])) {
    score += 12;
  }

  if (intent.hasCityIntent && hasAny(searchText, ["city", "urban", "commuting", "daily use", "daily commuting"])) {
    score += 10;
  }

  if (intent.hasPremiumIntent && hasAny(searchText, ["premium", "luxury", "flagship"])) {
    score += 10;
  }

  if (intent.hasMileageIntent && hasAny(searchText, ["hybrid", "efficiency", "fuel-efficient", "mileage", "cng"])) {
    score += 10;
  }

  if (intent.hasSportsPerformanceIntent && !intent.hasFamilyIntent) {
    const modelCategory = model.category.toLowerCase();
    const modelName = model.name.toLowerCase();
    const modelTags = model.recommendationTags.join(" ").toLowerCase();

    if (modelCategory.includes("mpv")) {
      score -= 60;
    }

    if (
      modelName.includes("rumion") ||
      modelName.includes("innova crysta") ||
      modelName.includes("innova hycross") ||
      modelName.includes("vellfire")
    ) {
      score -= 80;
    }

    if (
      hasAny(modelTags, ["style-focused", "city-use", "compact-suv", "city-car", "automatic-friendly", "compact"]) ||
      hasAny(searchText, ["style-focused", "city-use", "compact", "premium hatchback"])
    ) {
      score += 16;
    }

    if (modelCategory.includes("suv") && hasAny(modelTags, ["stylish", "road-presence"])) {
      score += 8;
    }
  }

  if (intent.budgetLimitLakh !== null) {
    const startingPrice = parseModelStartingPriceLakh(model);

    if (startingPrice !== null) {
      if (startingPrice <= intent.budgetLimitLakh) {
        score += 10;

        const priceGap = intent.budgetLimitLakh - startingPrice;
        if (priceGap >= 10) {
          score += 4;
        } else if (priceGap >= 5) {
          score += 2;
        }
      } else {
        score -= 8;
      }
    }
  }

  if (intent.normalizedQuery.includes(model.name.toLowerCase())) {
    score += 30;
  }

  if (intent.normalizedQuery.includes(model.slug.replace(/-/g, " "))) {
    score += 24;
  }

  if (intent.normalizedQuery.includes("premium family") && hasAny(searchText, ["hybrid", "family", "premium"])) {
    score += 6;
  }

  return score;
}

export function getAllToyotaModels(): ToyotaModelSummary[] {
  return toyotaKnowledge.map(toSummary);
}

export function getToyotaModelBySlug(slug: string): ToyotaModelKnowledge | null {
  const normalizedSlug = normalize(slug);
  return toyotaKnowledge.find((model) => model.slug === normalizedSlug) ?? null;
}

export function searchToyotaKnowledge(query: string): ToyotaModelSearchResult[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  const intent = extractToyotaSearchIntent(query);

  return toyotaKnowledge
    .map((model) => ({
      model,
      score: scoreModel(model, intent),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ model }) => toSearchResult(model));
}
