import { useState } from "react";
import { AlertCircle, ArrowDownToLine, Check, Download, Loader2, RefreshCw, Star } from "lucide-react";
import { downloadTheme, type StoreTheme } from "@/lib/theme-store";
import { UserHoverCard } from "@/views/profile/user-hover-card";
import { fmtCount } from "./format";

export function ThemeCard({
  theme,
  rank,
  onOpen,
}: {
  theme: StoreTheme;
  rank?: number;
  onOpen: (t: StoreTheme) => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const get = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (state === "loading" || state === "done") return;
    setState("loading");
    try {
      await downloadTheme(theme.id, theme.cover ?? theme.screenshots[0] ?? null, theme.versionsCount);
      setState("done");
    } catch {
      setState("error");
      window.setTimeout(() => setState("idle"), 2200);
    }
  };

  const topThree = rank != null && rank <= 3;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(theme)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(theme);
        }
      }}
      title={theme.name}
      className="group/card relative flex w-full cursor-pointer flex-col overflow-hidden rounded-[4px] border border-edge-soft bg-surface text-start outline-none transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-edge hover:shadow-[0_26px_50px_-28px_rgba(0,0,0,0.7)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-elevated">
        {theme.cover ? (
          <img
            src={theme.cover}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-[1.06] motion-reduce:transform-none"
          />
        ) : (
          <div className="flex h-full w-full">
            {theme.swatch.map((c, i) => (
              <div key={i} className="flex-1" style={{ background: c }} />
            ))}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        {rank != null && (
          <span
            className={`absolute start-2.5 top-2.5 grid h-7 min-w-7 place-items-center rounded-[4px] px-1.5 text-[12.5px] font-bold tabular-nums shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6)] ${
              topThree ? "bg-accent text-canvas" : "bg-black/60 text-white backdrop-blur-sm"
            }`}
          >
            {rank}
          </span>
        )}

        {theme.hasPendingUpdate ? (
          <span className="absolute end-2.5 top-2.5 flex items-center gap-1 rounded-[4px] bg-amber-400/90 px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-black shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6)]">
            <RefreshCw size={9} strokeWidth={2.6} /> Update queued
          </span>
        ) : theme.ratingCount > 0 ? (
          <span className="absolute end-2.5 top-2.5 flex items-center gap-1 rounded-[4px] bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm transition-opacity duration-200 group-hover/card:opacity-0">
            <Star size={10} className="fill-amber-300 text-amber-300" />
            {theme.ratingAvg.toFixed(1)}
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 flex translate-y-1.5 items-center gap-2 p-2.5 opacity-0 transition-all duration-200 ease-out group-hover/card:translate-y-0 group-hover/card:opacity-100 motion-reduce:translate-y-0">
          <button
            type="button"
            onClick={get}
            aria-label={state === "done" ? "Added to library" : "Get theme"}
            className={`flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[6px] text-[12.5px] font-semibold shadow-[0_8px_20px_-10px_rgba(0,0,0,0.7)] transition-colors ${
              state === "done"
                ? "bg-emerald-400 text-black"
                : state === "error"
                  ? "bg-danger text-white"
                  : "bg-white text-black hover:bg-white/90"
            }`}
          >
            {state === "loading" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : state === "done" ? (
              <Check key="done" size={14} className="harbor-pop" />
            ) : state === "error" ? (
              <AlertCircle size={14} />
            ) : (
              <ArrowDownToLine size={14} strokeWidth={2.4} />
            )}
            {state === "done" ? "In library" : state === "error" ? "Failed" : state === "loading" ? "Getting" : "Get"}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex h-1.5">
          {theme.swatch.map((c, i) => (
            <span key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-0.5 px-3.5 pb-3 pt-2.5">
        <span className="truncate text-[14.5px] font-semibold leading-snug tracking-tight text-ink">{theme.name}</span>
        <span className="flex items-center gap-1.5 truncate text-[11.5px] text-ink-subtle">
          {theme.authorHandle ? (
            <UserHoverCard handle={theme.authorHandle}>
              <span className="truncate text-ink-muted transition-colors hover:text-ink">{theme.author || "Anonymous"}</span>
            </UserHoverCard>
          ) : (
            <span className="truncate">{theme.author || "Anonymous"}</span>
          )}
          {theme.authorHandle && (
            <span className="shrink-0 font-display text-ink-subtle">@{theme.authorHandle}</span>
          )}
          <span className="text-ink-subtle/50">·</span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Download size={10.5} strokeWidth={2.2} />
            {fmtCount(theme.downloads)}
          </span>
        </span>
      </div>
    </div>
  );
}
