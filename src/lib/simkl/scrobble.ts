import { simklRequest } from "./client";

export type ScrobbleAction = "start" | "pause" | "stop";

export type EpisodeRef = { season?: number; episode?: number } | undefined;

// Simkl matches best when you send every identifier plus title and year. `metaId` gives the
// primary id; `info` merges any extra ids Harbor knows (a secondary imdb/tmdb) plus title/year.
export type ScrobbleInfo = { title?: string; year?: number | null; imdb?: string; tmdb?: number };

function node(ids: Record<string, unknown>, info?: ScrobbleInfo): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...ids };
  if (info?.imdb && /^tt\d+$/.test(info.imdb) && merged.imdb == null) merged.imdb = info.imdb;
  if (info?.tmdb != null && Number.isFinite(info.tmdb) && merged.tmdb == null) merged.tmdb = info.tmdb;
  const out: Record<string, unknown> = { ids: merged };
  if (info?.title) out.title = info.title;
  if (info?.year != null) out.year = info.year;
  return out;
}

export function buildBody(
  metaId: string,
  episode: EpisodeRef,
  progress: number,
  info?: ScrobbleInfo,
): Record<string, unknown> | null {
  const p = Math.min(100, Math.max(0, progress));
  const ep = { season: episode?.season ?? 1, number: episode?.episode };

  if (metaId.startsWith("tt")) {
    const imdb = metaId.split(":")[0];
    if (!/^tt\d+$/.test(imdb)) return null;
    return episode?.episode != null
      ? { progress: p, show: node({ imdb }, info), episode: ep }
      : { progress: p, movie: node({ imdb }, info) };
  }

  if (metaId.startsWith("tmdb:movie:")) {
    const id = Number(metaId.split(":")[2]);
    if (!Number.isFinite(id)) return null;
    return { progress: p, movie: node({ tmdb: id }, info) };
  }

  if (metaId.startsWith("tmdb:tv:")) {
    const id = Number(metaId.split(":")[2]);
    if (!Number.isFinite(id) || episode?.episode == null) return null;
    return { progress: p, show: node({ tmdb: id }, info), episode: ep };
  }

  const animePrefix = ["kitsu:", "mal:", "anilist:", "anidb:"].find((pre) => metaId.startsWith(pre));
  if (animePrefix) {
    const num = Number(metaId.split(":")[1]);
    if (!Number.isFinite(num)) return null;
    const idKey = animePrefix.slice(0, -1);
    return episode?.episode != null
      ? { progress: p, anime: node({ [idKey]: num }, info), episode: ep }
      : { progress: p, movie: node({ [idKey]: num }, info) };
  }

  return null;
}

export async function simklScrobble(
  action: ScrobbleAction,
  metaId: string,
  episode: EpisodeRef,
  progress: number,
  info?: ScrobbleInfo,
): Promise<void> {
  const body = buildBody(metaId, episode, progress, info);
  if (!body) return;
  try {
    await simklRequest(`/scrobble/${action}`, { method: "POST", body });
  } catch {
    /* swallow: scrobbling is best-effort */
  }
}
