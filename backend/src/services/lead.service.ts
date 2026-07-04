import { LeadStatus, Prisma } from "@prisma/client";
import prisma from "../lib/prisma";
import type {
  CreateLeadInput,
  CreateLeadFromChatInput,
  CreateTestDriveRequestInput,
  LeadListQueryInput,
  UpdateLeadFinanceInput,
  UpdateLeadNotesInput,
  UpdateLeadStatusInput,
  UpdateLeadTestDriveInput,
} from "../validators/lead.validator";

const createdLeadSelect = {
  id: true,
  name: true,
  phone: true,
  city: true,
  interestedModel: true,
  source: true,
  status: true,
  testDriveRequested: true,
  preferredTestDriveDate: true,
  preferredTestDriveTime: true,
  testDriveLocation: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LeadSelect;

const leadListSelect = {
  id: true,
  name: true,
  phone: true,
  city: true,
  interestedModel: true,
  budget: true,
  purchaseTimeline: true,
  testDriveRequested: true,
  preferredTestDriveDate: true,
  preferredTestDriveTime: true,
  testDriveLocation: true,
  financeAssistanceRequested: true,
  monthlyIncomeRange: true,
  downPaymentBudget: true,
  loanTenurePreference: true,
  emiBudget: true,
  source: true,
  status: true,
  notes: true,
  chatSummary: true,
  leadScore: true,
  leadScoreReason: true,
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

function buildLeadNotes(parts: Array<string | undefined>) {
  const notes = parts.filter((part): part is string => Boolean(part?.trim()));
  return notes.length > 0 ? notes.join(" | ") : null;
}

export async function createLead(input: CreateLeadInput) {
  return prisma.lead.create({
    data: {
      name: input.customerName,
      phone: input.phone,
      city: input.branch,
      interestedModel: input.modelInterest,
      source: input.source,
      status: LeadStatus.NEW,
      notes: buildLeadNotes([input.intent ? `Intent: ${input.intent}` : undefined]),
    },
    select: createdLeadSelect,
  });
}

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
        testDriveRequested: input.testDriveRequested ?? false,
        preferredTestDriveDate: input.preferredTestDriveDate,
        preferredTestDriveTime: input.preferredTestDriveTime,
        testDriveLocation: input.testDriveLocation,
        financeAssistanceRequested: input.financeAssistanceRequested ?? false,
        monthlyIncomeRange: input.monthlyIncomeRange,
        downPaymentBudget: input.downPaymentBudget,
        loanTenurePreference: input.loanTenurePreference,
        emiBudget: input.emiBudget,
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

export async function createTestDriveRequest(input: CreateTestDriveRequestInput) {
  return prisma.lead.create({
    data: {
      name: input.customerName,
      phone: input.phone,
      city: input.branch,
      interestedModel: input.model,
      source: input.source,
      status: LeadStatus.NEW,
      testDriveRequested: true,
      preferredTestDriveDate: input.preferredDate,
      preferredTestDriveTime: input.preferredTime,
      testDriveLocation: input.branch,
      notes: `Test drive request from n8n AI Advisor. Status: ${input.status}`,
    },
    select: createdLeadSelect,
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
      testDriveRequested: true,
      preferredTestDriveDate: true,
      preferredTestDriveTime: true,
      testDriveLocation: true,
      financeAssistanceRequested: true,
      monthlyIncomeRange: true,
      downPaymentBudget: true,
      loanTenurePreference: true,
      emiBudget: true,
      source: true,
      status: true,
      notes: true,
      chatSummary: true,
      leadScore: true,
      leadScoreReason: true,
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

export async function updateLeadInsights(
  id: string,
  input: {
    chatSummary: string;
    leadScore: number;
    leadScoreReason: string;
  }
) {
  return prisma.lead.update({
    where: { id },
    data: {
      chatSummary: input.chatSummary,
      leadScore: input.leadScore,
      leadScoreReason: input.leadScoreReason,
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

export async function updateLeadTestDrive(id: string, input: UpdateLeadTestDriveInput) {
  return prisma.lead.update({
    where: { id },
    data: {
      testDriveRequested: input.testDriveRequested,
      preferredTestDriveDate: input.testDriveRequested ? input.preferredTestDriveDate : null,
      preferredTestDriveTime: input.testDriveRequested ? input.preferredTestDriveTime : null,
      testDriveLocation: input.testDriveRequested ? input.testDriveLocation : null,
    },
  });
}

export async function updateLeadFinance(id: string, input: UpdateLeadFinanceInput) {
  return prisma.lead.update({
    where: { id },
    data: {
      financeAssistanceRequested: input.financeAssistanceRequested,
      monthlyIncomeRange: input.financeAssistanceRequested ? input.monthlyIncomeRange : null,
      downPaymentBudget: input.financeAssistanceRequested ? input.downPaymentBudget : null,
      loanTenurePreference: input.financeAssistanceRequested ? input.loanTenurePreference : null,
      emiBudget: input.financeAssistanceRequested ? input.emiBudget : null,
    },
  });
}
