import { API_BASE_URL } from "@/services/apiConfig";
import { authService } from "@/services/authService";

export async function requestJson<T>(
  path: string,
  init?: RequestInit,
  fallbackMessage = "No se pudo completar la operación.",
): Promise<T> {
  const csrfToken = authService.getCsrfToken();
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error("No se pudo conectar con el backend. Verificá que la API esté iniciada.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);

    if (response.status === 401 || response.status === 403) {
      authService.clearSession();
    }

    const message = body?.error?.message ?? fallbackMessage;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
