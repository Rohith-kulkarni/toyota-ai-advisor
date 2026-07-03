const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (!apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is not set");
}

export const config = {
  apiBaseUrl,
} as const;
