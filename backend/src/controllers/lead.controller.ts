import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  createLead,
  createLeadFromChat,
  createTestDriveRequest,
  getAllLeads,
  getLeadById,
  updateLeadFinance,
  updateLeadInsights,
  updateLeadNotes,
  updateLeadStatus,
  updateLeadTestDrive,
} from "../services/lead.service";
import { generateLeadInsights } from "../services/leadInsight.service";
import {
  createLeadSchema,
  createLeadFromChatSchema,
  createTestDriveRequestSchema,
  leadIdParamsSchema,
  leadListQuerySchema,
  pilotBranches,
  updateLeadFinanceSchema,
  updateLeadNotesSchema,
  updateLeadStatusSchema,
  updateLeadTestDriveSchema,
} from "../validators/lead.validator";

type CreatedLeadRecord = Awaited<ReturnType<typeof createLead>>;
type LeadListRecord = Awaited<ReturnType<typeof getAllLeads>>[number];
type LeadDetailRecord = NonNullable<Awaited<ReturnType<typeof getLeadById>>>;
type TestDriveLeadRecord = Awaited<ReturnType<typeof createTestDriveRequest>>;

function mapCreatedLeadItem(lead: CreatedLeadRecord) {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    city: lead.city,
    interestedModel: lead.interestedModel,
    source: lead.source,
    status: lead.status,
  };
}

function mapCreatedTestDriveLeadItem(lead: TestDriveLeadRecord) {
  return {
    ...mapCreatedLeadItem(lead),
    testDriveRequested: lead.testDriveRequested,
    preferredTestDriveDate: lead.preferredTestDriveDate,
    preferredTestDriveTime: lead.preferredTestDriveTime,
    testDriveLocation: lead.testDriveLocation,
    notes: lead.notes,
  };
}

function mapLeadListItem(lead: LeadListRecord) {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    city: lead.city,
    interestedModel: lead.interestedModel,
    budget: lead.budget,
    purchaseTimeline: lead.purchaseTimeline,
    testDriveRequested: lead.testDriveRequested,
    preferredTestDriveDate: lead.preferredTestDriveDate,
    preferredTestDriveTime: lead.preferredTestDriveTime,
    testDriveLocation: lead.testDriveLocation,
    financeAssistanceRequested: lead.financeAssistanceRequested,
    monthlyIncomeRange: lead.monthlyIncomeRange,
    downPaymentBudget: lead.downPaymentBudget,
    loanTenurePreference: lead.loanTenurePreference,
    emiBudget: lead.emiBudget,
    source: lead.source,
    status: lead.status,
    notes: lead.notes,
    chatSummary: lead.chatSummary,
    leadScore: lead.leadScore,
    leadScoreReason: lead.leadScoreReason,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    chatSession: lead.chatSessions[0]
      ? {
          sessionId: lead.chatSessions[0].sessionId,
        }
      : null,
  };
}

function mapLeadDetailItem(lead: LeadDetailRecord) {
  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    city: lead.city,
    interestedModel: lead.interestedModel,
    budget: lead.budget,
    purchaseTimeline: lead.purchaseTimeline,
    testDriveRequested: lead.testDriveRequested,
    preferredTestDriveDate: lead.preferredTestDriveDate,
    preferredTestDriveTime: lead.preferredTestDriveTime,
    testDriveLocation: lead.testDriveLocation,
    financeAssistanceRequested: lead.financeAssistanceRequested,
    monthlyIncomeRange: lead.monthlyIncomeRange,
    downPaymentBudget: lead.downPaymentBudget,
    loanTenurePreference: lead.loanTenurePreference,
    emiBudget: lead.emiBudget,
    source: lead.source,
    status: lead.status,
    notes: lead.notes,
    chatSummary: lead.chatSummary,
    leadScore: lead.leadScore,
    leadScoreReason: lead.leadScoreReason,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    chatSession: lead.chatSessions[0]
      ? {
          id: lead.chatSessions[0].id,
          sessionId: lead.chatSessions[0].sessionId,
          messages: lead.chatSessions[0].messages,
        }
      : null,
  };
}

function getPrismaErrorMessage(error: unknown): string | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return "Lead not found";
    }
  }

  return null;
}

function normalizeBranchName(branch: string): string | null {
  const normalizedBranch = branch.trim().toLowerCase();

  return (
    pilotBranches.find((candidate) => candidate.toLowerCase() === normalizedBranch) ?? null
  );
}

export async function createLeadEntry(req: Request, res: Response): Promise<void> {
  const result = createLeadSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: result.error.issues[0]?.message || "Invalid request body",
    });
    return;
  }

  const lead = await createLead(result.data);

  res.status(201).json({
    status: "ok",
    message: "Lead created successfully",
    lead: mapCreatedLeadItem(lead),
  });
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

export async function createTestDriveEntry(req: Request, res: Response): Promise<void> {
  const result = createTestDriveRequestSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: result.error.issues[0]?.message || "Invalid request body",
    });
    return;
  }

  const branch = normalizeBranchName(result.data.branch);

  if (!branch) {
    res.status(400).json({
      message:
        "Test drive pilot is currently available only for Sanathnagar, Tolichowki, and Kushaiguda.",
    });
    return;
  }

  const lead = await createTestDriveRequest({
    ...result.data,
    branch,
  });

  res.status(201).json({
    status: "ok",
    message: "Test drive request logged. Dealership team will confirm availability.",
    lead: mapCreatedTestDriveLeadItem(lead),
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
    leads: leads.map(mapLeadListItem),
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
    lead: mapLeadDetailItem(lead),
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
    const refreshedLead = await getLeadById(lead.id);

    if (!refreshedLead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    res.json({
      status: "ok",
      lead: mapLeadDetailItem(refreshedLead),
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
    const refreshedLead = await getLeadById(lead.id);

    if (!refreshedLead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    res.json({
      status: "ok",
      lead: mapLeadDetailItem(refreshedLead),
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

export async function changeLeadTestDrive(req: Request, res: Response): Promise<void> {
  const paramsResult = leadIdParamsSchema.safeParse({
    id: req.params.id,
  });
  const bodyResult = updateLeadTestDriveSchema.safeParse(req.body);

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
    const lead = await updateLeadTestDrive(paramsResult.data.id, bodyResult.data);
    const refreshedLead = await getLeadById(lead.id);

    if (!refreshedLead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    res.json({
      status: "ok",
      lead: mapLeadDetailItem(refreshedLead),
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

export async function changeLeadFinance(req: Request, res: Response): Promise<void> {
  const paramsResult = leadIdParamsSchema.safeParse({
    id: req.params.id,
  });
  const bodyResult = updateLeadFinanceSchema.safeParse(req.body);

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
    const lead = await updateLeadFinance(paramsResult.data.id, bodyResult.data);
    const refreshedLead = await getLeadById(lead.id);

    if (!refreshedLead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    res.json({
      status: "ok",
      lead: mapLeadDetailItem(refreshedLead),
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

export async function generateInsights(req: Request, res: Response): Promise<void> {
  const paramsResult = leadIdParamsSchema.safeParse({
    id: req.params.id,
  });

  if (!paramsResult.success) {
    res.status(400).json({
      message: paramsResult.error.issues[0]?.message || "Invalid lead id",
    });
    return;
  }

  const lead = await getLeadById(paramsResult.data.id);

  if (!lead) {
    res.status(404).json({
      message: "Lead not found",
    });
    return;
  }

  const insights = generateLeadInsights(lead);
  await updateLeadInsights(paramsResult.data.id, insights);
  const refreshedLead = await getLeadById(paramsResult.data.id);

  if (!refreshedLead) {
    res.status(404).json({
      message: "Lead not found",
    });
    return;
  }

  res.json({
    status: "ok",
    lead: mapLeadDetailItem(refreshedLead),
  });
}

export const leadController = {
  createLeadEntry,
  createFromChat,
  createTestDriveEntry,
  listLeads,
  getLead,
  changeLeadStatus,
  changeLeadNotes,
  changeLeadTestDrive,
  changeLeadFinance,
  generateInsights,
};
