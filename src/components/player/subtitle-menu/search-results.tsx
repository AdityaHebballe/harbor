import { Check, ChevronDown, Loader2, Plus, Save } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Flag } from "@/components/flag";
import { useContextMenu } from "@/lib/context-menu";
import { saveSubtitleToDisk } from "@/lib/subtitles/save-to-disk";
import type { SubResult } from "@/lib/subtitles/types";
import { useT } from "@/lib/i18n";

export function LangGroup({
  lang,
  items,
  defaultOpen,
  onAdd,
}: {
  lang: string;
  items: SubResult[];
  defaultOpen: boolean;
  onAdd: (r: SubResult) => void | Promise<boolean | void>;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-edge-soft/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 bg-canvas/40 px-4 py-2 text-start transition-colors hover:bg-canvas/60"
      >
        <Flag language={lang} size="sm" showLabel={false} />
        <span className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-ink-muted">{lang}</span>
        <span className="text-[11px] tabular-nums text-ink-subtle">{items.length}</span>
        <ChevronDown
          size={14}
          strokeWidth={2.4}
          className={`ms-auto shrink-0 text-ink-subtle transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && items.slice(0, 30).map((r) => <ResultRow key={r.id} result={r} lang={lang} onAdd={() => onAdd(r)} />)}
    </div>
  );
}

function ResultRow({
  result,
  lang,
  onAdd,
}: {
  result: SubResult;
  lang: string;
  onAdd: () => void | Promise<boolean | void>;
}) {
  const t = useT();
  const { open } = useContextMenu();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);
  const addTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      if (addTimer.current !== null) window.clearTimeout(addTimer.current);
    },
    [],
  );

  const handleAdd = async () => {
    if (adding) return;
    setAdding(true);
    try {
      const ok = await Promise.resolve(onAdd());
      if (ok !== false) {
        setAdded(true);
        if (addTimer.current !== null) window.clearTimeout(addTimer.current);
        addTimer.current = window.setTimeout(() => setAdded(false), 2600);
      }
    } finally {
      setAdding(false);
    }
  };

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const ok = await saveSubtitleToDisk(result.url, {
        title: result.title,
        lang: result.lang,
        format: result.format,
        label: t("Subtitle"),
      });
      if (ok) {
        setSaved(true);
        if (timer.current !== null) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setSaved(false), 1400);
      }
    } catch {
      /* noop */
    } finally {
      setBusy(false);
    }
  };

  const sourceColor =
    {
      addon: "text-blue-400",
      opensubtitles: "text-emerald-400",
      wyzie: "text-purple-400",
      jimaku: "text-amber-400",
      podnapisi: "text-rose-400",
      subdl: "text-teal-400",
      gestdown: "text-orange-400",
      subsource: "text-sky-400",
    }[result.source] || "text-ink-subtle";

  return (
    <div
      onContextMenu={(e) => open(e, { kind: "subtitle", label: result.title || lang, download })}
      className={`group flex w-full items-start gap-3 px-4 py-2.5 transition-colors duration-300 ${
        added ? "bg-emerald-400/12" : "hover:bg-canvas/60"
      }`}
    >
      <button onClick={handleAdd} className="flex min-w-0 flex-1 items-start gap-3 text-start">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          {adding ? (
            <Loader2 size={14} className="animate-spin text-ink-subtle" />
          ) : added ? (
            <Check size={15} strokeWidth={2.6} className="text-emerald-400 animate-in zoom-in-50 duration-200" />
          ) : (
            <Plus size={14} strokeWidth={2.4} className="text-ink-subtle transition-colors group-hover:text-ink" />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="truncate text-[13.5px] text-ink">{result.title || lang}</span>
            {added && (
              <span className="shrink-0 rounded bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300 animate-in fade-in slide-in-from-left-1 duration-200">
                {t("Added")}
              </span>
            )}
          </span>
          <span className="flex items-center gap-2 text-[11.5px] text-ink-subtle">
            <span className={`font-semibold capitalize ${sourceColor}`}>{result.source}</span>
            {result.format && (
              <>
                <span aria-hidden>·</span>
                <span className="uppercase">{result.format}</span>
              </>
            )}
            {typeof result.downloads === "number" && result.downloads > 0 && (
              <>
                <span aria-hidden>·</span>
                <span>{t("{count} dl", { count: compactNumber(result.downloads) })}</span>
              </>
            )}
            {result.hearingImpaired && (
              <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-200">
                {t("HI/SDH")}
              </span>
            )}
            {result.forced && (
              <span className="rounded bg-sky-400/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-sky-200">
                {t("Forced")}
              </span>
            )}
          </span>
        </div>
      </button>
      <span
        role="button"
        tabIndex={0}
        title={saved ? t("Saved to disk") : t("Download to disk")}
        aria-label={t("Download subtitle to disk")}
        onClick={(e) => {
          e.stopPropagation();
          void download();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            void download();
          }
        }}
        className={`mt-0.5 inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors ${
          saved ? "text-accent" : "text-ink-subtle hover:bg-elevated hover:text-ink"
        }`}
      >
        {busy ? (
          <Loader2 size={13} className="animate-spin" />
        ) : saved ? (
          <Check size={13} strokeWidth={2.4} />
        ) : (
          <Save size={13} strokeWidth={2} />
        )}
      </span>
    </div>
  );
}

export function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-7 items-center rounded-full px-2.5 text-[11.5px] font-semibold transition-colors ${
        active ? "bg-elevated text-ink ring-1 ring-edge" : "bg-raised text-ink-muted hover:bg-elevated/80"
      }`}
    >
      {children}
    </button>
  );
}

function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
