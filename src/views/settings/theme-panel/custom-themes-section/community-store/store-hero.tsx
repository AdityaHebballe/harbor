import { useState } from "react";
import { AlertCircle, ArrowDownToLine, Check, Loader2, Sparkles, Star } from "lucide-react";
import { downloadTheme, type StoreTheme } from "@/lib/theme-store";
import { fmtCount } from "./format";

const enter = "animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none";

export function StoreHero({
  theme,
  label,
  onOpen,
}: {
  theme: StoreTheme;
  label: string;
  onOpen: (t: StoreTheme) => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const get = async () => {
    if (state === "loading" || state === "done") return;
    setState("loading");
    try {
      await downloadTheme(theme.id, theme.cover ?? theme.screenshots[0] ?? null, theme.versionsCount);
      setState("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Download failed.");
      setState("error");
      window.setTimeout(() => setState("idle"), 6000);
    }
  };

  return (
    <section className="relative flex min-h-[380px] flex-col justify-end overflow-hidden rounded-[14px] border border-edge-soft bg-canvas">
      {theme.cover ? (
        <img src={theme.cover} alt="" draggable={false} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${theme.swatch[0] ?? "#222"}, ${theme.swatch[1] ?? theme.swatch[0] ?? "#333"}, ${theme.swatch[2] ?? theme.swatch[0] ?? "#222"})`,
          }}
        />
      )}
      {!theme.cover && (
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background: `radial-gradient(60% 90% at 18% 8%, ${theme.swatch[2] ?? "#fff"}22 0%, transparent 60%), radial-gradient(55% 80% at 88% 92%, ${theme.swatch[0] ?? "#000"}33 0%, transparent 62%)`,
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.74)_16%,rgba(0,0,0,0.46)_37%,rgba(0,0,0,0.18)_58%,transparent_80%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(0,0,0,0.66)_0%,rgba(0,0,0,0.28)_36%,transparent_64%)]" />

      <div className="relative z-10 flex max-w-[40rem] flex-col gap-4 p-8 sm:p-10">
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm ${enter}`}
          style={{ animationDelay: "40ms" }}
        >
          <Sparkles size={12} className="text-accent" />
          {label}
        </span>

        <h2
          className={`font-display text-[clamp(34px,4.6vw,54px)] font-medium leading-[1.02] tracking-tight text-white [text-shadow:0_2px_28px_rgba(0,0,0,0.55)] ${enter}`}
          style={{ animationDelay: "90ms" }}
        >
          {theme.name}
        </h2>

        <div
          className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-white/85 ${enter}`}
          style={{ animationDelay: "140ms" }}
        >
          {theme.ratingCount > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Star size={14} className="fill-amber-300 text-amber-300" />
              <span className="tabular-nums">{theme.ratingAvg.toFixed(1)}</span>
              <span className="text-white/55">({theme.ratingCount})</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <ArrowDownToLine size={13} strokeWidth={2.2} />
            {fmtCount(theme.downloads)} downloads
          </span>
          <span className="text-white/55">by {theme.author || "Anonymous"}</span>
        </div>

        {theme.blurb && (
          <p
            className={`line-clamp-2 max-w-[34rem] text-[14px] leading-relaxed text-white/75 ${enter}`}
            style={{ animationDelay: "180ms" }}
          >
            {theme.blurb}
          </p>
        )}

        <div className={`flex items-center gap-2.5 ${enter}`} style={{ animationDelay: "210ms" }}>
          <div className="flex h-6 items-center gap-1.5 rounded-full bg-black/30 px-2.5 backdrop-blur-sm">
            {theme.swatch.slice(0, 5).map((c, i) => (
              <span key={i} className="h-3.5 w-3.5 rounded-full ring-1 ring-white/25" style={{ background: c }} />
            ))}
          </div>
        </div>

        <div className={`mt-1 flex flex-wrap items-center gap-3 ${enter}`} style={{ animationDelay: "250ms" }}>
          <button
            type="button"
            onClick={get}
            disabled={state === "loading"}
            className={`flex h-11 items-center justify-center gap-2 rounded-[8px] px-6 text-[14px] font-semibold shadow-[0_12px_30px_-14px_rgba(0,0,0,0.8)] transition-[transform,background-color] duration-150 hover:opacity-95 active:scale-[0.97] disabled:opacity-80 motion-reduce:active:scale-100 ${
              state === "done"
                ? "bg-emerald-400 text-black"
                : state === "error"
                  ? "bg-danger text-white"
                  : "bg-white text-black"
            }`}
          >
            {state === "loading" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : state === "done" ? (
              <Check key="done" size={16} className="harbor-pop" />
            ) : state === "error" ? (
              <AlertCircle size={16} />
            ) : (
              <ArrowDownToLine size={16} strokeWidth={2.4} />
            )}
            {state === "done" ? "In library" : state === "error" ? "Try again" : state === "loading" ? "Getting" : "Get theme"}
          </button>
          <button
            type="button"
            onClick={() => onOpen(theme)}
            className="flex h-11 items-center justify-center rounded-[8px] bg-white/12 px-6 text-[14px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-md transition-[transform,background-color] duration-150 hover:bg-white/20 active:scale-[0.97] motion-reduce:active:scale-100"
          >
            View details
          </button>
        </div>
        {state === "error" && errorMsg && (
          <p className={`max-w-[34rem] text-[12.5px] leading-snug text-white/80 ${enter}`}>{errorMsg}</p>
        )}
      </div>
    </section>
  );
}
