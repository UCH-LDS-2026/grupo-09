import { API_BASE_URL } from "@/services/apiConfig";
import { authService } from "@/services/authService";

export async function requestJson<T>(
  path: string,
  init?: RequestInit,
  fallbackMessage = "No se pudo completar la operación.",
): Promise<T> {
  const csrfToken = authService.getCsrfToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message ?? fallbackMessage;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
