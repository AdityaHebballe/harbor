import { Film, Loader2, Minus, Plus, Tv, X } from "lucide-react";
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import type { TitleCandidate } from "@/lib/subtitles/title-search";

export function TitleSuggestDropdown({
  items,
  loading,
  onPick,
}: {
  items: TitleCandidate[];
  loading: boolean;
  onPick: (c: TitleCandidate) => void;
}) {
  const t = useT();
  if (!loading && items.length === 0) return null;
  return (
    <div className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-[300px] overflow-y-auto rounded-xl border border-edge bg-elevated/98 p-1.5 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
      {loading && items.length === 0 ? (
        <div className="flex items-center gap-2 px-3 py-2.5 text-[12.5px] text-ink-muted">
          <Loader2 size={13} className="animate-spin" /> {t("Searching titles…")}
        </div>
      ) : (
        items.map((c) => (
          <button
            key={c.imdbId}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(c);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-start transition-colors hover:bg-raised"
          >
            <span className="flex h-12 w-8 shrink-0 items-center justify-center overflow-hidden rounded bg-raised">
              {c.poster ? (
                <img src={c.poster} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : c.type === "series" ? (
                <Tv size={14} className="text-ink-subtle" />
              ) : (
                <Film size={14} className="text-ink-subtle" />
              )}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-medium text-ink">{c.name}</span>
              <span className="flex items-center gap-1.5 text-[11px] text-ink-subtle">
                {c.type === "series" ? <Tv size={11} /> : <Film size={11} />}
                <span>{c.type === "series" ? t("Series") : t("Movie")}</span>
                {c.year && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="tabular-nums">{c.year}</span>
                  </>
                )}
              </span>
            </span>
          </button>
        ))
      )}
    </div>
  );
}

export function TargetBar({
  label,
  type,
  season,
  episode,
  onSeason,
  onEpisode,
  onClear,
  showClear,
  trailing,
}: {
  label: string;
  type: "movie" | "series";
  season?: number;
  episode?: number;
  onSeason: (n: number) => void;
  onEpisode: (n: number) => void;
  onClear: () => void;
  showClear: boolean;
  trailing?: ReactNode;
}) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-4 pb-2.5">
      {showClear && (
        <span className="flex items-center gap-1.5 rounded-full bg-raised px-2.5 py-1 text-[12px] font-semibold text-ink">
          {type === "series" ? <Tv size={12} className="text-accent" /> : <Film size={12} className="text-accent" />}
          <span className="max-w-[150px] truncate">{label}</span>
          <button
            type="button"
            onClick={onClear}
            aria-label={t("Back to what's playing")}
            className="ms-0.5 flex h-4 w-4 items-center justify-center text-ink-subtle transition-colors hover:text-ink"
          >
            <X size={12} strokeWidth={2.4} />
          </button>
        </span>
      )}
      {type === "series" && (
        <div className="flex items-center gap-1.5">
          <NumStepper label={t("Season")} value={season ?? 1} onChange={onSeason} />
          <NumStepper label={t("Ep")} value={episode ?? 1} onChange={onEpisode} />
        </div>
      )}
      {trailing && <span className="flex flex-1 items-center gap-1.5">{trailing}</span>}
    </div>
  );
}

function NumStepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-raised px-1 py-0.5">
      <span className="ps-1 pe-0.5 text-[10.5px] font-bold uppercase tracking-wide text-ink-subtle">{label}</span>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label={`${label} -1`}
        className="flex h-6 w-6 items-center justify-center rounded text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
      >
        <Minus size={12} strokeWidth={2.4} />
      </button>
      <span className="min-w-[20px] text-center text-[12.5px] font-semibold tabular-nums text-ink">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={`${label} +1`}
        className="flex h-6 w-6 items-center justify-center rounded text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
      >
        <Plus size={12} strokeWidth={2.4} />
      </button>
    </div>
  );
}
