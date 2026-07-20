import { authToken } from "@/lib/theme-auth";

const API = "https://harbor.site/themes/api";

function url(path: string): string {
  return `${API}${path}`;
}

function headers(bearer: boolean, hasBody: boolean): Record<string, string> {
  const h: Record<string, string> = {};
  if (hasBody) h["Content-Type"] = "application/json";
  if (bearer) {
    const token = authToken();
    if (token) h.Authorization = `Bearer ${token}`;
  }
  return h;
}

async function unwrap<T>(r: Response): Promise<T> {
  const d = await r.json().catch(() => ({}) as Record<string, unknown>);
  if (!r.ok) {
    const message = typeof d.error === "string" ? d.error : `Request failed (${r.status}).`;
    const err = new Error(message) as Error & { status?: number; code?: string; reason?: string };
    err.status = r.status;
    if (typeof d.code === "string") err.code = d.code;
    if (typeof d.message === "string") err.reason = d.message;
    throw err;
  }
  return d as T;
}

export async function getJson<T>(path: string, opts?: { bearer?: boolean; signal?: AbortSignal }): Promise<T> {
  const r = await fetch(url(path), { headers: headers(opts?.bearer ?? false, false), signal: opts?.signal });
  return unwrap<T>(r);
}

export async function postJson<T>(path: string, body: Record<string, unknown>, opts?: { bearer?: boolean }): Promise<T> {
  const r = await fetch(url(path), {
    method: "POST",
    headers: headers(opts?.bearer ?? false, true),
    body: JSON.stringify(body),
  });
  return unwrap<T>(r);
}
