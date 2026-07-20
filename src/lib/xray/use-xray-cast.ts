import { useEffect, useState } from "react";
import type { Meta } from "@/lib/cinemeta";
import { tmdbDetails, type CastEntry, type TmdbDetail } from "@/lib/providers/tmdb";
import { useSettings } from "@/lib/settings";

export function useXrayCast(
  meta: Meta | null,
  open: boolean,
): { cast: CastEntry[] | null; details: TmdbDetail | null; loading: boolean } {
  const { settings } = useSettings();
  const [details, setDetails] = useState<TmdbDetail | null>(null);
  const [cast, setCast] = useState<CastEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const key = settings.tmdbKey;

  useEffect(() => {
    if (!open || !meta || !key) return;
    let cancelled = false;
    setLoading(true);
    tmdbDetails(key, meta)
      .then((d) => {
        if (cancelled) return;
        setDetails(d);
        setCast(d?.cast ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setDetails(null);
          setCast([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, meta?.id, key]);

  return { cast, details, loading };
}
