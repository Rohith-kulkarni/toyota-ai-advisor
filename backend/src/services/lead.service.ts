import { LeadStatus, Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import type {
  CreateLeadFromChatInput,
  LeadListQueryInput,
  UpdateLeadNotesInput,
  UpdateLeadStatusInput,
} from "../validators/lead.validator";

const leadListSelect = {
  id: true,
  name: true,
  phone: true,
  city: true,
  interestedModel: true,
  budget: true,
  purchaseTimeline: true,
  source: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  chatSessions: {
    take: 1,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      sessionId: true,
    },
  },
} satisfies Prisma.LeadSelect;

export async function createLeadFromChat(input: CreateLeadFromChatInput) {
  return prisma.$transaction(async (tx) => {
    const chatSession = await tx.chatSession.findUnique({
      where: { sessionId: input.sessionId },
    });

    if (!chatSession) {
      return null;
    }

    const lead = await tx.lead.create({
      data: {
        name: input.name,
        phone: input.phone,
        city: input.city,
        interestedModel: input.interestedModel,
        budget: input.budget,
        purchaseTimeline: input.purchaseTimeline,
        notes: input.notes,
      },
    });

    const updatedChatSession = await tx.chatSession.update({
      where: { id: chatSession.id },
      data: {
        leadId: lead.id,
      },
    });

    return {
      lead,
      chatSession: updatedChatSession,
    };
  });
}

export async function getAllLeads(filters: LeadListQueryInput) {
  return prisma.lead.findMany({
    where: {
      status: filters.status,
      city: filters.city ? { equals: filters.city, mode: "insensitive" } : undefined,
      interestedModel: filters.interestedModel
        ? { contains: filters.interestedModel, mode: "insensitive" }
        : undefined,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: leadListSelect,
  });
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      city: true,
      interestedModel: true,
      budget: true,
      purchaseTimeline: true,
      source: true,
      status: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      chatSessions: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          sessionId: true,
          messages: {
            take: 10,
            orderBy: {
              createdAt: "desc",
            },
            select: {
              id: true,
              role: true,
              message: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });
}

export async function updateLeadStatus(id: string, input: UpdateLeadStatusInput) {
  return prisma.lead.update({
    where: { id },
    data: {
      status: input.status as LeadStatus,
    },
  });
}

export async function updateLeadNotes(id: string, input: UpdateLeadNotesInput) {
  return prisma.lead.update({
    where: { id },
    data: {
      notes: input.notes,
    },
  });
}
