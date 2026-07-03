import type { Request, Response } from "express";
import {
  getAllToyotaModels,
  getToyotaModelBySlug,
  searchToyotaKnowledge,
} from "../services/knowledge.service";

export function getModels(_req: Request, res: Response): void {
  res.json({
    status: "ok",
    models: getAllToyotaModels(),
  });
}

export function getModelBySlug(req: Request, res: Response): void {
  const model = getToyotaModelBySlug(String(req.params.slug));

  if (!model) {
    res.status(404).json({
      message: "Toyota model not found",
    });
    return;
  }

  res.json({
    status: "ok",
    model,
  });
}

export function searchKnowledge(req: Request, res: Response): void {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  if (!q) {
    res.status(400).json({
      message: "Query parameter q is required",
    });
    return;
  }

  res.json({
    status: "ok",
    query: q,
    results: searchToyotaKnowledge(q),
  });
}

export const knowledgeController = {
  getModels,
  getModelBySlug,
  searchKnowledge,
};
