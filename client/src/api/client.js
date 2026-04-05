const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "/api" : "http://localhost:4000/api");

function getAuthHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};
}

export async function apiFetch(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
    throw new Error(payload?.message || "Request failed.");
  }

  return payload;
}
