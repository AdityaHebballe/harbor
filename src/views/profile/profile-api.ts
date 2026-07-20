import { safeFetch } from "@/lib/safe-fetch";
import { authToken } from "@/lib/theme-auth";
import type {
  ActivityItem,
  Badge,
  Comment,
  CommentPage,
  Friend,
  ProfileSettingsInput,
  ProfileSummary,
  SocialEntry,
} from "./profile-types";

const BASE = "https://harbor.site/themes/api/social";

function authHeaders(): Record<string, string> {
  const t = authToken();
  return t ? { authorization: `Bearer ${t}` } : {};
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await safeFetch(`${BASE}${path}`, { headers: authHeaders(), signal });
  if (res.status === 404) throw new ProfileNotFound();
  if (!res.ok) throw new ProfileApiError(res.status);
  return (await res.json()) as T;
}

export class ProfileNotFound extends Error {}

export class ProfileApiError extends Error {
  status: number;
  constructor(status: number) {
    super(`profile api ${status}`);
    this.status = status;
  }
}

export function fetchSummary(handle: string, signal?: AbortSignal) {
  return getJson<ProfileSummary>(`/u/${encodeURIComponent(handle)}`, signal);
}

export function fetchFriends(handle: string, signal?: AbortSignal) {
  return getJson<Friend[]>(`/u/${encodeURIComponent(handle)}/friends`, signal);
}

export function fetchBadges(handle: string, signal?: AbortSignal) {
  return getJson<Badge[]>(`/u/${encodeURIComponent(handle)}/badges`, signal);
}

export function fetchActivity(handle: string, signal?: AbortSignal) {
  return getJson<ActivityItem[]>(`/u/${encodeURIComponent(handle)}/activity?limit=24`, signal);
}

export function fetchComments(handle: string, cursor?: string, signal?: AbortSignal) {
  const q = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return getJson<CommentPage>(`/u/${encodeURIComponent(handle)}/comments${q}`, signal);
}

export async function postComment(handle: string, body: string): Promise<Comment> {
  const res = await safeFetch(`${BASE}/u/${encodeURIComponent(handle)}/comments`, {
    method: "POST",
    headers: { ...authHeaders(), "content-type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (res.status === 429) throw new ProfileApiError(429);
  if (!res.ok) throw new ProfileApiError(res.status);
  return (await res.json()) as Comment;
}

export async function deleteComment(handle: string, id: string): Promise<void> {
  const res = await safeFetch(
    `${BASE}/u/${encodeURIComponent(handle)}/comments/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: authHeaders() },
  );
  if (!res.ok) throw new ProfileApiError(res.status);
}

export async function saveSettings(input: ProfileSettingsInput): Promise<ProfileSummary> {
  const res = await safeFetch(`${BASE}/me/profile`, {
    method: "PATCH",
    headers: { ...authHeaders(), "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new ProfileApiError(res.status);
  return (await res.json()) as ProfileSummary;
}

export async function saveSlogan(slogan: string): Promise<ProfileSummary> {
  const res = await safeFetch(`${BASE}/me/profile`, {
    method: "PATCH",
    headers: { ...authHeaders(), "content-type": "application/json" },
    body: JSON.stringify({ slogan }),
  });
  if (!res.ok) throw new ProfileApiError(res.status);
  return (await res.json()) as ProfileSummary;
}

export async function saveSocials(socials: SocialEntry[]): Promise<ProfileSummary> {
  const res = await safeFetch(`${BASE}/me/profile`, {
    method: "PATCH",
    headers: { ...authHeaders(), "content-type": "application/json" },
    body: JSON.stringify({ socials }),
  });
  if (!res.ok) throw new ProfileApiError(res.status);
  return (await res.json()) as ProfileSummary;
}
