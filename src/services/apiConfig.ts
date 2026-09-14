function resolveDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:3001/api";
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  return `${protocol}//${window.location.hostname}:3001/api`;
}

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? resolveDefaultApiBaseUrl();
