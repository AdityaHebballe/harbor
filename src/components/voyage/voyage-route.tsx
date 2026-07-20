import { Check, Dices, Film, Flag } from "lucide-react";
import type { Meta } from "@/lib/cinemeta";
import { useT } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";
import { usePosterChain } from "@/components/poster";
import { useView } from "@/lib/view";
import { chooseHeading, closeVoyage, endVoyage, metaById, rerollHeadings } from "@/lib/voyage/store";
import type { Voyage } from "@/lib/voyage/types";
import { PortCard } from "./port-card";

export function VoyageRoute({ voyage }: { voyage: Voyage }) {
  const t = useT();
  const { openMeta, openPicker } = useView();
  const route = voyage.routeIds.map((id) => metaById(voyage, id)).filter((m): m is Meta => !!m);
  const headings = voyage.headingIds.map((id) => metaById(voyage, id)).filter((m): m is Meta => !!m);
  const complete = voyage.routeIds.length >= voyage.targetLength;

  const watch = (meta: Meta) => {
    closeVoyage();
    if (meta.type === "movie") openPicker(meta, undefined, { autoPlay: true, resume: true });
    else openMeta(meta);
  };

  const setSail = (meta: Meta) => {
    chooseHeading(meta.id);
    watch(meta);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: voyage.accent }}>
          {t("On a voyage")}
        </span>
        <h2 className="font-display text-[24px] font-medium tracking-tight text-ink">{voyage.themeLabel}</h2>
      </div>

      <RouteRail voyage={voyage} complete={complete} />

      {complete ? (
        <CompletePanel total={voyage.targetLength} onDone={endVoyage} />
      ) : headings.length === 0 ? (
        <ExhaustedPanel onDone={endVoyage} />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-semibold text-ink">
              {route.length === 0 ? t("Choose your starting film") : t("Where to next?")}
            </span>
            <span className="text-[11px] text-ink-subtle">{t("Choose 1 of 3")}</span>
          </div>
          <div className="grid grid-cols-3 gap-3.5">
            {headings.map((meta, i) => (
              <PortCard key={meta.id} meta={meta} index={i} state="heading" onClick={() => setSail(meta)} />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={endVoyage}
              className="flex h-8 items-center gap-1.5 rounded-full border border-edge-soft px-3 text-[12px] font-semibold text-ink-muted transition-colors hover:border-danger/40 hover:text-danger"
            >
              <Flag size={13} strokeWidth={2.2} /> {t("End voyage")}
            </button>
            <button
              type="button"
              onClick={rerollHeadings}
              className="flex h-8 items-center gap-1.5 rounded-full border border-edge-soft px-3 text-[12px] font-semibold text-ink-muted transition-colors hover:border-edge hover:text-ink"
            >
              <Dices size={13} strokeWidth={2.2} /> {t("Show me 3 others")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RouteRail({ voyage, complete }: { voyage: Voyage; complete: boolean }) {
  const t = useT();
  const done = voyage.routeIds.length;
  const current = done - 1;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-ink-subtle">{t("Your queue")}</span>
        <span className="text-[12px] font-semibold tabular-nums text-ink-muted">
          {complete ? voyage.targetLength : Math.max(1, done)} <span className="text-ink-subtle">{t("of")} {voyage.targetLength}</span>
        </span>
      </div>
      <ol className="flex items-center gap-2">
        {Array.from({ length: voyage.targetLength }).map((_, i) => {
          const id = voyage.routeIds[i];
          const meta = id ? metaById(voyage, id) : undefined;
          const isCurrent = i === current;
          return (
            <li key={i} className="flex min-w-0 flex-1 items-center gap-2">
              <div
                className={`relative aspect-[2/3] w-full max-w-[52px] shrink-0 overflow-hidden rounded-[8px] ring-1 ${
                  meta ? "ring-edge-soft" : "ring-edge-soft/40"
                }`}
                style={isCurrent ? { boxShadow: `0 0 0 1.5px ${voyage.accent}` } : undefined}
              >
                {meta ? (
                  <SlotPoster meta={meta} dim={!isCurrent} />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-elevated text-[11px] font-semibold tabular-nums text-ink-subtle">
                    {i + 1}
                  </span>
                )}
                {meta && !isCurrent && (
                  <span className="absolute end-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-canvas/85 text-ink">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </div>
              {i < voyage.targetLength - 1 && (
                <span
                  aria-hidden
                  className="h-[2px] flex-1 rounded-full transition-colors duration-500"
                  style={{ background: i < done ? voyage.accent : "var(--color-edge-soft)" }}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SlotPoster({ meta, dim }: { meta: Meta; dim: boolean }) {
  const { settings } = useSettings();
  const poster = usePosterChain(settings.rpdbKey, meta.id, meta.poster, meta.type === "series" ? "series" : "movie");
  return (
    <img
      src={poster.src}
      onError={poster.onError}
      alt=""
      draggable={false}
      className={`h-full w-full object-cover ${dim ? "brightness-[0.7]" : ""}`}
    />
  );
}

function CompletePanel({ total, onDone }: { total: number; onDone: () => void }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-3 rounded-[10px] border border-dashed border-edge bg-canvas/30 px-6 py-10 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-[10px] bg-accent/12 text-accent">
        <Film size={24} strokeWidth={1.9} />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <span className="text-[16px] font-semibold text-ink">{t("Voyage complete")}</span>
        <span className="text-[13px] leading-relaxed text-ink-subtle">
          {t("You saw the whole run through.")} {total} {t("films, start to finish. Start another whenever you like.")}
        </span>
      </div>
      <button
        type="button"
        onClick={onDone}
        className="mt-1 flex h-10 items-center rounded-full bg-ink px-5 text-[13px] font-semibold text-canvas transition-opacity hover:opacity-90"
      >
        {t("Start another")}
      </button>
    </div>
  );
}

function ExhaustedPanel({ onDone }: { onDone: () => void }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-3 rounded-[10px] border border-dashed border-edge bg-canvas/30 px-6 py-9 text-center">
      <span className="text-[13.5px] text-ink-muted">{t("You've sailed these waters dry.")}</span>
      <button
        type="button"
        onClick={onDone}
        className="flex h-9 items-center rounded-full border border-edge-soft px-4 text-[12.5px] font-semibold text-ink-muted transition-colors hover:border-edge hover:text-ink"
      >
        {t("Wrap up here")}
      </button>
    </div>
  );
}
