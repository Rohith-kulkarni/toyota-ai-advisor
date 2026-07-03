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

function normalize(value: string): string {
  return value.trim().toLowerCase();
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

export function getAllToyotaModels(): ToyotaModelSummary[] {
  return toyotaKnowledge.map(toSummary);
}

export function getToyotaModelBySlug(slug: string): ToyotaModelKnowledge | null {
  const normalizedSlug = normalize(slug);
  return toyotaKnowledge.find((model) => model.slug === normalizedSlug) ?? null;
}

export function searchToyotaKnowledge(query: string): ToyotaModelSummary[] {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  return toyotaKnowledge
    .filter((model) => buildSearchText(model).includes(normalizedQuery))
    .map(toSummary);
}
