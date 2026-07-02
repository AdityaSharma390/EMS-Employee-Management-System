export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export async function clientFetch(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  const token = getCookie("token");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Include credentials for CORS cookie verification
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  return res;
}
