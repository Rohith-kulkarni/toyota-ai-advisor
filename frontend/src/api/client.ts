import { config } from "../config";

type RequestOptions = {
  method?: string;
  body?: unknown;
};

type ApiErrorResponse = {
  message?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const hasJsonBody = contentType.includes("application/json");
  const payload = hasJsonBody ? ((await response.json()) as T | ApiErrorResponse) : null;

  if (!response.ok) {
    const errorMessage =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string" &&
      payload.message
        ? payload.message
        : `Request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  if (payload === null) {
    return undefined as T;
  }

  return payload as T;
}

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SALES";
};

export type LeadStatus = "NEW" | "CONTACTED" | "TEST_DRIVE_SCHEDULED" | "CONVERTED" | "LOST";

export type LeadSummary = {
  id: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  interestedModel: string | null;
  budget: string | null;
  purchaseTimeline: string | null;
  testDriveRequested: boolean;
  preferredTestDriveDate: string | null;
  preferredTestDriveTime: string | null;
  testDriveLocation: string | null;
  financeAssistanceRequested: boolean;
  monthlyIncomeRange: string | null;
  downPaymentBudget: string | null;
  loanTenurePreference: string | null;
  emiBudget: string | null;
  source: string;
  status: LeadStatus;
  notes: string | null;
  chatSummary: string | null;
  leadScore: number | null;
  leadScoreReason: string | null;
  createdAt: string;
  updatedAt: string;
  chatSession: {
    sessionId: string;
  } | null;
};

export type LeadDetail = LeadSummary & {
  chatSession: {
    id: string;
    sessionId: string;
    messages: Array<{
      id: string;
      role: "USER" | "ASSISTANT" | "SYSTEM";
      message: string;
      createdAt: string;
    }>;
  } | null;
};

export async function loginAdmin(email: string, password: string) {
  return request<{ status: "ok"; user: AdminUser }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function getCurrentAdmin() {
  return request<{ status: "ok"; user: AdminUser }>("/auth/me");
}

export async function logoutAdmin() {
  return request<{ status: "ok"; message: string }>("/auth/logout", {
    method: "POST",
  });
}

export async function getLeads(filters: {
  status?: LeadStatus;
  city?: string;
  interestedModel?: string;
}) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }
  if (filters.city) {
    params.set("city", filters.city);
  }
  if (filters.interestedModel) {
    params.set("interestedModel", filters.interestedModel);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  return request<{ status: "ok"; leads: LeadSummary[] }>(`/leads${query}`);
}

export async function getLeadById(id: string) {
  return request<{ status: "ok"; lead: LeadDetail }>(`/leads/${id}`);
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  return request<{ status: "ok"; lead: LeadDetail }>(`/leads/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export async function updateLeadNotes(id: string, notes: string) {
  return request<{ status: "ok"; lead: LeadDetail }>(`/leads/${id}/notes`, {
    method: "PATCH",
    body: { notes },
  });
}

export async function updateLeadTestDrive(
  id: string,
  payload: {
    testDriveRequested: boolean;
    preferredTestDriveDate?: string;
    preferredTestDriveTime?: string;
    testDriveLocation?: string;
  }
) {
  return request<{ status: "ok"; lead: LeadDetail }>(`/leads/${id}/test-drive`, {
    method: "PATCH",
    body: payload,
  });
}

export async function updateLeadFinance(
  id: string,
  payload: {
    financeAssistanceRequested: boolean;
    monthlyIncomeRange?: string;
    downPaymentBudget?: string;
    loanTenurePreference?: string;
    emiBudget?: string;
  }
) {
  return request<{ status: "ok"; lead: LeadDetail }>(`/leads/${id}/finance`, {
    method: "PATCH",
    body: payload,
  });
}

export async function generateLeadInsights(id: string) {
  return request<{ status: "ok"; lead: LeadDetail }>(`/leads/${id}/insights`, {
    method: "POST",
  });
}

export async function sendChatMessage(payload: { sessionId?: string; message: string }) {
  return request<{
    status: "ok";
    sessionId: string;
    reply: string;
    matchedModels: Array<{ slug: string; name: string }>;
  }>("/chat/message", {
    method: "POST",
    body: payload,
  });
}

export async function createLeadFromChat(payload: {
  sessionId: string;
  name?: string;
  phone: string;
  city?: string;
  interestedModel?: string;
  budget?: string;
  purchaseTimeline?: string;
  testDriveRequested?: boolean;
  preferredTestDriveDate?: string;
  preferredTestDriveTime?: string;
  testDriveLocation?: string;
  financeAssistanceRequested?: boolean;
  monthlyIncomeRange?: string;
  downPaymentBudget?: string;
  loanTenurePreference?: string;
  emiBudget?: string;
  notes?: string;
}) {
  return request<{ status: "ok"; lead: unknown; sessionId: string }>("/leads/from-chat", {
    method: "POST",
    body: payload,
  });
}
