export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function clientFetch(path: string, options: RequestInit = {}) {
  // Merge headers and include credentials
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
  });
  return res;
}
