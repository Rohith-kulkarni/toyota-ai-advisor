import { LeadStatus } from "@prisma/client";
import { z } from "zod";

export const createLeadFromChatSchema = z.object({
  sessionId: z.string().trim().min(1, "sessionId is required"),
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1, "phone is required"),
  city: z.string().trim().min(1).optional(),
  interestedModel: z.string().trim().min(1).optional(),
  budget: z.string().trim().min(1).optional(),
  purchaseTimeline: z.string().trim().min(1).optional(),
  testDriveRequested: z.boolean().optional(),
  preferredTestDriveDate: z.string().trim().min(1).optional(),
  preferredTestDriveTime: z.string().trim().min(1).optional(),
  testDriveLocation: z.string().trim().min(1).optional(),
  financeAssistanceRequested: z.boolean().optional(),
  monthlyIncomeRange: z.string().trim().min(1).optional(),
  downPaymentBudget: z.string().trim().min(1).optional(),
  loanTenurePreference: z.string().trim().min(1).optional(),
  emiBudget: z.string().trim().min(1).optional(),
  notes: z.string().trim().min(1).optional(),
});

export const createLeadSchema = z.object({
  customerName: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1, "phone is required"),
  branch: z.string().trim().min(1).optional(),
  modelInterest: z.string().trim().min(1).optional(),
  intent: z.string().trim().min(1).optional(),
  source: z.string().trim().min(1).default("ai_advisor_chat"),
});

export const pilotBranches = ["Sanathnagar", "Tolichowki", "Kushaiguda"] as const;

export const createTestDriveRequestSchema = z.object({
  customerName: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(1, "phone is required"),
  branch: z.string().trim().min(1, "branch is required"),
  model: z.string().trim().min(1, "model is required"),
  preferredDate: z.string().trim().min(1, "preferredDate is required"),
  preferredTime: z.string().trim().min(1, "preferredTime is required"),
  status: z.string().trim().min(1).default("pending_confirmation"),
  source: z.string().trim().min(1).default("ai_advisor"),
});

export const leadListQuerySchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  city: z.string().trim().min(1).optional(),
  interestedModel: z.string().trim().min(1).optional(),
});

export const leadIdParamsSchema = z.object({
  id: z.string().trim().min(1, "Lead id is required"),
});

export const updateLeadStatusSchema = z.object({
  status: z.nativeEnum(LeadStatus),
});

export const updateLeadNotesSchema = z.object({
  notes: z.string().trim().min(1, "notes is required"),
});

export const updateLeadTestDriveSchema = z.object({
  testDriveRequested: z.boolean(),
  preferredTestDriveDate: z.string().trim().min(1).optional(),
  preferredTestDriveTime: z.string().trim().min(1).optional(),
  testDriveLocation: z.string().trim().min(1).optional(),
});

export const updateLeadFinanceSchema = z.object({
  financeAssistanceRequested: z.boolean(),
  monthlyIncomeRange: z.string().trim().min(1).optional(),
  downPaymentBudget: z.string().trim().min(1).optional(),
  loanTenurePreference: z.string().trim().min(1).optional(),
  emiBudget: z.string().trim().min(1).optional(),
});

export type CreateLeadFromChatInput = z.infer<typeof createLeadFromChatSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type CreateTestDriveRequestInput = z.infer<typeof createTestDriveRequestSchema>;
export type LeadListQueryInput = z.infer<typeof leadListQuerySchema>;
export type LeadIdParamsInput = z.infer<typeof leadIdParamsSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type UpdateLeadNotesInput = z.infer<typeof updateLeadNotesSchema>;
export type UpdateLeadTestDriveInput = z.infer<typeof updateLeadTestDriveSchema>;
export type UpdateLeadFinanceInput = z.infer<typeof updateLeadFinanceSchema>;
