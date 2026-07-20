import { safeFetch } from "@/lib/safe-fetch";
import type { Meta } from "@/lib/cinemeta";
import { watchTitleKey } from "@/lib/playback-history";
import type { VoyageTheme } from "./types";

const BASE = "https://v3-cinemeta.strem.io/catalog";

export type PoolExclude = { ids?: Set<string>; titles?: Set<string> };

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function generatePool(theme: VoyageTheme, exclude?: PoolExclude): Promise<Meta[]> {
  const url = theme.genre
    ? `${BASE}/${theme.type}/top/genre=${encodeURIComponent(theme.genre)}.json`
    : `${BASE}/${theme.type}/top.json`;
  try {
    const res = await safeFetch(url);
    if (!res.ok) return [];
    const j = (await res.json()) as { metas?: Meta[] };
    const metas = Array.isArray(j.metas) ? j.metas : [];
    const ids = exclude?.ids;
    const titles = exclude?.titles;
    const clean = metas.filter((m) => {
      if (!m || !m.id || !m.poster || !m.name) return false;
      if (ids?.has(m.id)) return false;
      if (titles?.size && titles.has(watchTitleKey(m.name))) return false;
      return true;
    });
    return shuffle(clean).slice(0, 40);
  } catch {
    return [];
  }
}
