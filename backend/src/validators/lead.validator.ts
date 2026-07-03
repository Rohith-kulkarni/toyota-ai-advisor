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
  notes: z.string().trim().min(1).optional(),
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

export type CreateLeadFromChatInput = z.infer<typeof createLeadFromChatSchema>;
export type LeadListQueryInput = z.infer<typeof leadListQuerySchema>;
export type LeadIdParamsInput = z.infer<typeof leadIdParamsSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
export type UpdateLeadNotesInput = z.infer<typeof updateLeadNotesSchema>;
