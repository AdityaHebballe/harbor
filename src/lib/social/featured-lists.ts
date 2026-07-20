import { safeFetch } from "@/lib/safe-fetch";
import { authToken } from "@/lib/theme-auth";
import { readLists, type CustomList } from "@/lib/custom-lists";

const BASE = "https://harbor.site/themes/api/social";

export const MAX_FEATURED_LISTS = 6;
export const MAX_FEATURED_ITEMS = 24;

export type FeaturedItem = {
  id: string;
  name: string;
  poster: string;
  type: string;
};

export type FeaturedList = {
  name: string;
  items: FeaturedItem[];
};

export type PickableList = {
  id: string;
  name: string;
  items: FeaturedItem[];
};

export function toPickableList(list: CustomList): PickableList {
  return {
    id: list.id,
    name: list.name,
    items: list.items.slice(0, MAX_FEATURED_ITEMS).map((it) => ({
      id: it.id,
      name: it.name,
      poster: it.poster ?? "",
      type: it.type,
    })),
  };
}

export function readLocalLists(): PickableList[] {
  return readLists().map(toPickableList);
}

export function toFeaturedList(list: PickableList): FeaturedList {
  return { name: list.name, items: list.items };
}

function authHeaders(): Record<string, string> {
  const t = authToken();
  return t ? { authorization: `Bearer ${t}` } : {};
}

function readFeatured(data: unknown): FeaturedList[] {
  const lists = (data as { featuredLists?: unknown } | null)?.featuredLists;
  return Array.isArray(lists) ? (lists as FeaturedList[]) : [];
}

export async function fetchFeaturedLists(handle: string, signal?: AbortSignal): Promise<FeaturedList[]> {
  const res = await safeFetch(`${BASE}/u/${encodeURIComponent(handle)}`, { headers: authHeaders(), signal });
  if (!res.ok) throw new Error(`featured lists ${res.status}`);
  return readFeatured(await res.json());
}

export async function saveFeaturedLists(lists: FeaturedList[]): Promise<FeaturedList[]> {
  const res = await safeFetch(`${BASE}/me/profile`, {
    method: "PATCH",
    headers: { ...authHeaders(), "content-type": "application/json" },
    body: JSON.stringify({ featuredLists: lists }),
  });
  if (!res.ok) throw new Error(`save featured lists ${res.status}`);
  const echoed = readFeatured(await res.json());
  return echoed.length || lists.length === 0 ? echoed : lists;
}
