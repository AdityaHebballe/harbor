import { useSyncExternalStore } from "react";
import type { Meta } from "@/lib/cinemeta";
import { getVoteEntries } from "@/lib/feed/preferences";
import { recentlyPlayed } from "@/lib/playback-history";
import { externalWatchedIds } from "@/lib/feed/external-watched";
import { movieWatchedIds } from "@/lib/movie-watched";
import { watchedFlagIds } from "@/lib/watched-flag";
import { generatePool, type PoolExclude } from "./generate";
import type { Voyage, VoyageState, VoyageTheme } from "./types";

const KEY = "harbor.voyage.v1";

function dayKey(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function load(): VoyageState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as VoyageState;
  } catch {
    /* ignore */
  }
  return { active: null, streak: 0, lastSail: null };
}

let state: VoyageState = load();
let open = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
function set(next: Partial<VoyageState>) {
  state = { ...state, ...next };
  persist();
  emit();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useVoyage(): VoyageState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
export function useVoyageOpen(): boolean {
  return useSyncExternalStore(subscribe, () => open, () => open);
}

export function openVoyage() {
  open = true;
  emit();
}
export function closeVoyage() {
  open = false;
  emit();
}

function sailFields(): Pick<VoyageState, "streak" | "lastSail"> {
  const t = dayKey(0);
  if (state.lastSail === t) return { streak: state.streak, lastSail: t };
  const streak = state.lastSail === dayKey(-1) ? state.streak + 1 : 1;
  return { streak, lastSail: t };
}

function buildExclude(): PoolExclude {
  const ids = new Set<string>();
  for (const e of getVoteEntries()) {
    if (e.vote !== "down") continue;
    ids.add(e.id);
    if (e.altId) ids.add(e.altId);
  }
  const watched = recentlyPlayed();
  for (const id of watched.ids) ids.add(id);
  for (const id of movieWatchedIds()) ids.add(id);
  for (const id of watchedFlagIds()) ids.add(id);
  for (const id of externalWatchedIds()) ids.add(id);
  return { ids, titles: watched.titles };
}

function pickHeadings(pool: Meta[], used: Set<string>, seen: Set<string>, n = 3, last?: Meta): string[] {
  const blocked = buildExclude().ids ?? new Set<string>();
  const eligible = pool.filter((m) => !used.has(m.id) && !blocked.has(m.id));
  if (eligible.length === 0) return [];
  const out: string[] = [];
  const take = (from: Meta[]) => {
    const copy = from.filter((m) => !out.includes(m.id));
    while (out.length < n && copy.length) {
      const idx = Math.floor(Math.random() * copy.length);
      out.push(copy[idx].id);
      copy.splice(idx, 1);
    }
  };
  const unseen = eligible.filter((m) => !seen.has(m.id));
  const lastGenres = last?.genres?.length ? new Set(last.genres) : null;
  if (lastGenres) {
    const scored = (unseen.length ? unseen : eligible)
      .map((m) => ({ m, s: (m.genres ?? []).reduce((a, g) => a + (lastGenres.has(g) ? 1 : 0), 0) }))
      .filter((x) => x.s >= 1)
      .sort((a, b) => b.s - a.s);
    if (scored.length) {
      const topK = scored.slice(0, Math.min(3, scored.length));
      out.push(topK[Math.floor(Math.random() * topK.length)].m.id);
    }
  }
  take(unseen);
  take(eligible);
  return out;
}

export async function startVoyage(theme: VoyageTheme, targetLength = 5): Promise<boolean> {
  const pool = await generatePool(theme, buildExclude());
  if (pool.length < 4) return false;
  const headingIds = pickHeadings(pool, new Set(), new Set(), 3);
  const voyage: Voyage = {
    id: `v-${Date.now()}`,
    themeId: theme.id,
    themeLabel: theme.label,
    tagline: theme.tagline,
    accent: theme.accent,
    createdAt: Date.now(),
    targetLength,
    pool,
    routeIds: [],
    headingIds,
    seen: [...headingIds],
  };
  set({ active: voyage, ...sailFields() });
  return true;
}

export function chooseHeading(id: string) {
  const v = state.active;
  if (!v || v.routeIds.includes(id)) return;
  const routeIds = [...v.routeIds, id];
  const used = new Set(routeIds);
  const seen = new Set(v.seen ?? []);
  const complete = routeIds.length >= v.targetLength;
  const last = metaById(v, id);
  const headingIds = complete ? [] : pickHeadings(v.pool, used, seen, 3, last);
  const nextSeen = complete ? (v.seen ?? []) : [...new Set([...(v.seen ?? []), ...headingIds])];
  set({ active: { ...v, routeIds, headingIds, seen: nextSeen }, ...sailFields() });
}

export function rerollHeadings() {
  const v = state.active;
  if (!v) return;
  const lastId = v.routeIds[v.routeIds.length - 1];
  const last = lastId ? metaById(v, lastId) : undefined;
  const used = new Set(v.routeIds);
  const seen = new Set(v.seen ?? []);
  const headingIds = pickHeadings(v.pool, used, seen, 3, last);
  if (headingIds.length === 0) return;
  const nextSeen = [...new Set([...(v.seen ?? []), ...headingIds])];
  set({ active: { ...v, headingIds, seen: nextSeen } });
}

export function endVoyage() {
  set({ active: null });
}

export function metaById(v: Voyage, id: string): Meta | undefined {
  return v.pool.find((m) => m.id === id);
}
