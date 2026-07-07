const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function Http(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    console.error("API Error:", error);
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}