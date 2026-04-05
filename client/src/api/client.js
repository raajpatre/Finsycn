const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = configuredApiBaseUrl || "/api";

function buildRequestUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function getDefaultErrorMessage(response, payload) {
  if (payload?.message) {
    return payload.message;
  }

  if (!import.meta.env.DEV && !configuredApiBaseUrl && response.status === 404) {
    return "API not configured. Set VITE_API_BASE_URL for the deployed client.";
  }

  return "Request failed.";
}

function getAuthHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};
}

export async function apiFetch(path, { token, method = "GET", body } = {}) {
  const response = await fetch(buildRequestUrl(path), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(token)
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(getDefaultErrorMessage(response, payload));
  }

  return payload;
}
