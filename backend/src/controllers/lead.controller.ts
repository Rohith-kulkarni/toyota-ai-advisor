import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  createLeadFromChat,
  getAllLeads,
  getLeadById,
  updateLeadNotes,
  updateLeadStatus,
} from "../services/lead.service";
import {
  createLeadFromChatSchema,
  leadIdParamsSchema,
  leadListQuerySchema,
  updateLeadNotesSchema,
  updateLeadStatusSchema,
} from "../validators/lead.validator";

function getPrismaErrorMessage(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return "Lead not found";
    }
  }

  return null;
}

export async function createFromChat(req: Request, res: Response): Promise<void> {
  const result = createLeadFromChatSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: result.error.issues[0]?.message || "Invalid request body",
    });
    return;
  }

  const created = await createLeadFromChat(result.data);

  if (!created) {
    res.status(404).json({
      message: "Chat session not found",
    });
    return;
  }

  res.status(201).json({
    status: "ok",
    lead: created.lead,
    sessionId: created.chatSession.sessionId,
  });
}

export async function listLeads(req: Request, res: Response): Promise<void> {
  const result = leadListQuerySchema.safeParse(req.query);

  if (!result.success) {
    res.status(400).json({
      message: result.error.issues[0]?.message || "Invalid query parameters",
    });
    return;
  }

  const leads = await getAllLeads(result.data);

  res.json({
    status: "ok",
    leads: leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      city: lead.city,
      interestedModel: lead.interestedModel,
      budget: lead.budget,
      purchaseTimeline: lead.purchaseTimeline,
      source: lead.source,
      status: lead.status,
      notes: lead.notes,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      chatSession: lead.chatSessions[0]
        ? {
            sessionId: lead.chatSessions[0].sessionId,
          }
        : null,
    })),
  });
}

export async function getLead(req: Request, res: Response): Promise<void> {
  const result = leadIdParamsSchema.safeParse({
    id: req.params.id,
  });

  if (!result.success) {
    res.status(400).json({
      message: result.error.issues[0]?.message || "Invalid lead id",
    });
    return;
  }

  const lead = await getLeadById(result.data.id);

  if (!lead) {
    res.status(404).json({
      message: "Lead not found",
    });
    return;
  }

  res.json({
    status: "ok",
    lead: {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      city: lead.city,
      interestedModel: lead.interestedModel,
      budget: lead.budget,
      purchaseTimeline: lead.purchaseTimeline,
      source: lead.source,
      status: lead.status,
      notes: lead.notes,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      chatSession: lead.chatSessions[0]
        ? {
            id: lead.chatSessions[0].id,
            sessionId: lead.chatSessions[0].sessionId,
            messages: lead.chatSessions[0].messages,
          }
        : null,
    },
  });
}

export async function changeLeadStatus(req: Request, res: Response): Promise<void> {
  const paramsResult = leadIdParamsSchema.safeParse({
    id: req.params.id,
  });
  const bodyResult = updateLeadStatusSchema.safeParse(req.body);

  if (!paramsResult.success) {
    res.status(400).json({
      message: paramsResult.error.issues[0]?.message || "Invalid lead id",
    });
    return;
  }

  if (!bodyResult.success) {
    res.status(400).json({
      message: bodyResult.error.issues[0]?.message || "Invalid request body",
    });
    return;
  }

  try {
    const lead = await updateLeadStatus(paramsResult.data.id, bodyResult.data);
    res.json({
      status: "ok",
      lead,
    });
  } catch (error) {
    const message = getPrismaErrorMessage(error);

    if (message) {
      res.status(404).json({ message });
      return;
    }

    throw error;
  }
}

export async function changeLeadNotes(req: Request, res: Response): Promise<void> {
  const paramsResult = leadIdParamsSchema.safeParse({
    id: req.params.id,
  });
  const bodyResult = updateLeadNotesSchema.safeParse(req.body);

  if (!paramsResult.success) {
    res.status(400).json({
      message: paramsResult.error.issues[0]?.message || "Invalid lead id",
    });
    return;
  }

  if (!bodyResult.success) {
    res.status(400).json({
      message: bodyResult.error.issues[0]?.message || "Invalid request body",
    });
    return;
  }

  try {
    const lead = await updateLeadNotes(paramsResult.data.id, bodyResult.data);
    res.json({
      status: "ok",
      lead,
    });
  } catch (error) {
    const message = getPrismaErrorMessage(error);

    if (message) {
      res.status(404).json({ message });
      return;
    }

    throw error;
  }
}

export const leadController = {
  createFromChat,
  listLeads,
  getLead,
  changeLeadStatus,
  changeLeadNotes,
};
