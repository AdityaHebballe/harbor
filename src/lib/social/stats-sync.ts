import { useEffect, useState } from "react";
import { recentlyPlayed } from "@/lib/playback-history";
import { library, type LibraryItem } from "@/lib/stremio";
import { authToken } from "@/lib/theme-auth";
import { socialPost } from "./client";

export function isWatchedItem(i: LibraryItem): boolean {
  const s = i.state;
  if (!s) return false;
  if ((s.flaggedWatched ?? 0) >= 1) return true;
  if ((s.timesWatched ?? 0) >= 1) return true;
  if (s.watched) return true;
  if (s.lastWatched && Number.isFinite(Date.parse(s.lastWatched))) return true;
  return false;
}

export async function computeWatchedCount(authKey: string): Promise<number | null> {
  const ids = new Set<string>();
  let libOk = false;
  try {
    const lib = await library(authKey);
    libOk = true;
    for (const i of lib) if (i._id && isWatchedItem(i)) ids.add(i._id);
  } catch {
    libOk = false;
  }
  try {
    for (const id of recentlyPlayed().ids) ids.add(id);
  } catch {
    return libOk ? ids.size : null;
  }
  if (!libOk && ids.size === 0) return null;
  return ids.size;
}

export async function pushStats(watched: number | null, mangaRead: number | null): Promise<void> {
  if (!authToken()) return;
  const body: Record<string, number> = {};
  if (typeof watched === "number" && watched >= 0) body.watched = watched;
  if (typeof mangaRead === "number" && mangaRead >= 0) body.mangaRead = mangaRead;
  if (!Object.keys(body).length) return;
  try {
    await socialPost("/social/u/me/stats", body);
  } catch {
    return;
  }
}

export async function syncProfileStats(authKey: string | null | undefined, mangaRead: number): Promise<void> {
  let watched: number | null = null;
  if (authKey) watched = await computeWatchedCount(authKey);
  else {
    try {
      watched = recentlyPlayed().ids.size;
    } catch {
      watched = null;
    }
  }
  await pushStats(watched, mangaRead);
}

export function useLibraryWatchedCount(authKey: string | null | undefined, enabled: boolean): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled || !authKey) {
      setCount(0);
      return;
    }
    let alive = true;
    computeWatchedCount(authKey).then((c) => {
      if (alive && typeof c === "number") setCount(c);
    });
    return () => {
      alive = false;
    };
  }, [authKey, enabled]);
  return count;
}
