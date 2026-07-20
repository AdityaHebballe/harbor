import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, ArrowDownToLine, Check, Loader2, RefreshCw, Share2, Star, X } from "lucide-react";
import { downloadTheme, rateTheme, type StoreTheme } from "@/lib/theme-store";
import { fmtCount } from "./format";
import { CommentsSection } from "./comments/comments-section";

export function ThemeDetail({ theme, onClose }: { theme: StoreTheme; onClose: () => void }) {
  const [t, setT] = useState(theme);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [myRating, setMyRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const download = async () => {
    if (state === "loading" || state === "done") return;
    setState("loading");
    setErrMsg(null);
    try {
      await downloadTheme(t.id, t.cover ?? t.screenshots[0] ?? null, t.versionsCount);
      setState("done");
    } catch (e) {
      setState("error");
      setErrMsg(e instanceof Error ? e.message : "Download failed.");
    }
  };

  const rate = async (v: number) => {
    setMyRating(v);
    try {
      setT(await rateTheme(t.id, v));
    } catch {
      /* ignore */
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(t.share);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const shown = hover || myRating || Math.round(t.ratingAvg);

  return createPortal(
    <div className="fixed inset-0 z-[230] flex items-center justify-center p-4 sm:p-6">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-canvas/75 backdrop-blur-sm" />
      <div className="modal-panel relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[6px] border border-edge-soft bg-elevated shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute end-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white/90 backdrop-blur-md transition-colors hover:bg-black/65 hover:text-white"
        >
          <X size={17} />
        </button>

        <div className="min-h-0 overflow-y-auto [scrollbar-width:thin]">
          <div className="relative">
            {t.cover ? (
              <img src={t.cover} alt="" className="aspect-video w-full object-cover" />
            ) : (
              <div
                className="aspect-video w-full"
                style={{ background: `linear-gradient(135deg, ${t.swatch[0] ?? "#222"}, ${t.swatch[1] ?? t.swatch[0] ?? "#333"}, ${t.swatch[2] ?? "#222"})` }}
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.55)_28%,rgba(0,0,0,0.12)_54%,transparent_78%)]" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-6">
              <div className="flex items-center gap-1.5">
                {t.swatch.map((c, i) => (
                  <span key={i} className="h-3.5 w-3.5 rounded-[3px] ring-1 ring-white/20" style={{ background: c }} />
                ))}
              </div>
              <h2 className="font-display text-[clamp(24px,3.4vw,34px)] font-medium leading-tight tracking-tight text-white [text-shadow:0_2px_20px_rgba(0,0,0,0.5)]">
                {t.name}
              </h2>
              <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] font-medium text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  {t.authorAvatar && (
                    <img src={t.authorAvatar} alt="" className="h-4 w-4 rounded-full object-cover ring-1 ring-white/25" />
                  )}
                  by {t.author || "Anonymous"}
                </span>
                <span className="text-white/40">·</span>
                <span className="tabular-nums">{fmtCount(t.downloads)} downloads</span>
                {t.ratingCount > 0 && (
                  <>
                    <span className="text-white/40">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Star size={12} className="fill-amber-300 text-amber-300" />
                      {t.ratingAvg.toFixed(1)} ({t.ratingCount})
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={download}
                disabled={state === "loading" || state === "done"}
                className={`flex h-11 items-center gap-2 rounded-[8px] px-5 text-[14px] font-semibold transition-[transform,background-color] hover:opacity-95 active:scale-[0.97] disabled:opacity-90 motion-reduce:active:scale-100 ${
                  state === "done" ? "bg-emerald-400 text-black" : state === "error" ? "bg-danger text-white" : "bg-white text-black"
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
                onClick={share}
                className="flex h-11 items-center gap-2 rounded-[8px] border border-edge-soft px-4 text-[13.5px] font-medium text-ink-muted transition-colors hover:border-edge hover:text-ink"
              >
                {copied ? <Check size={15} /> : <Share2 size={15} />} {copied ? "Copied" : "Share"}
              </button>
              <div
                className="ms-auto flex items-center gap-0.5"
                role="group"
                aria-label="Rate this theme"
                onMouseLeave={() => setHover(0)}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => rate(n)}
                    onMouseEnter={() => setHover(n)}
                    aria-label={`Rate ${n} stars`}
                    className="p-0.5 transition-transform hover:scale-110 active:scale-95 motion-reduce:transform-none"
                  >
                    <Star size={21} className={n <= shown ? "fill-amber-300 text-amber-300" : "text-ink-subtle"} />
                  </button>
                ))}
              </div>
            </div>
            {errMsg && <p className="text-[12.5px] text-danger">{errMsg}</p>}

            {t.hasPendingUpdate && (
              <div className="flex items-start gap-2.5 rounded-[8px] border border-amber-400/25 bg-amber-400/10 px-3.5 py-3 text-[12.5px] leading-relaxed text-amber-200/90">
                <RefreshCw size={15} className="mt-0.5 shrink-0 text-amber-300" />
                <span>
                  <span className="font-semibold text-amber-200">Update queued.</span> The author submitted a new
                  version that's in review. You're seeing the current published version until it's approved.
                </span>
              </div>
            )}

            {t.blurb && <p className="text-[14px] leading-relaxed text-ink-muted">{t.blurb}</p>}

            {t.screenshots.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {t.screenshots.map((s, i) => (
                  <img key={i} src={s} alt="" loading="lazy" className="w-full rounded-[6px] border border-edge-soft" />
                ))}
              </div>
            )}

            <div className="h-px bg-edge-soft" />

            <CommentsSection themeId={t.id} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
