import { cookies } from "next/headers";
import { API_URL } from "./api-client";

export async function serverFetch(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Cookie", `token=${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  
  return res;
}
