const BASE_URL = process.env.NEXT_PUBLIC_AUTH_API_URL;

export async function AuthHttp(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    console.error("Auth API Error:", error);
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}