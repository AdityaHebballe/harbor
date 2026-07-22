import { Info } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import type { RankSource } from "@/lib/harbor-rank";

type Tab = { source: RankSource; label: string; provenance: string };

const TABS: Tab[] = [
  {
    source: "harbor",
    label: "Harbor Rank",
    provenance: "Our all-time ranking of a body of work, fully explained.",
  },
  {
    source: "tmdb",
    label: "Top on TMDB",
    provenance: "Who is being watched and searched right now. Live popularity.",
  },
  {
    source: "imdb",
    label: "Top on IMDb",
    provenance: "Built from IMDb's public datasets. Career ratings volume.",
  },
  {
    source: "consensus",
    label: "Consensus",
    provenance:
      "A blend of the sources above by percentile. Degrades gracefully when one is missing.",
  },
];

function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el) {
    const oy = getComputedStyle(el).overflowY;
    if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) return el;
    el = el.parentElement;
  }
  return null;
}

export function PeopleSourceSwitch({
  source,
  onSource,
  onExplain,
}: {
  source: RankSource;
  onSource: (source: RankSource) => void;
  onExplain: () => void;
}) {
  const t = useT();
  const listRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const [solid, setSolid] = useState(false);

  const measure = useCallback(() => {
    const list = listRef.current;
    const index = TABS.findIndex((tab) => tab.source === source);
    const btn = btnRefs.current[index];
    if (!list || !btn) return;
    const listBox = list.getBoundingClientRect();
    const btnBox = btn.getBoundingClientRect();
    const left = btnBox.left - listBox.left;
    const width = btnBox.width;
    setIndicator((prev) => (prev.left === left && prev.width === width ? prev : { left, width }));
  }, [source]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(list);
    for (const btn of btnRefs.current) if (btn) ro.observe(btn);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const scroller = findScrollParent(barRef.current);
    if (!scroller) return;
    const onScroll = () => setSolid(scroller.scrollTop > 4);
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  const provenance = TABS.find((tab) => tab.source === source)?.provenance ?? "";

  return (
    <div
      ref={barRef}
      className={`sticky top-0 z-30 -mx-6 px-6 transition-colors duration-200 motion-reduce:transition-none ${
        solid ? "bg-canvas/95 backdrop-blur ring-1 ring-edge-soft" : "bg-transparent"
      }`}
    >
      <div className="flex items-center gap-3 pt-3">
        <div
          ref={listRef}
          role="tablist"
          aria-label={t("Ranking source")}
          className="relative flex flex-wrap items-center gap-1"
        >
          {TABS.map((tab, i) => {
            const active = tab.source === source;
            return (
              <button
                key={tab.source}
                ref={(node) => {
                  btnRefs.current[i] = node;
                }}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => onSource(tab.source)}
                className={`flex min-h-[44px] items-center rounded-md px-3 text-[14px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none ${
                  active ? "text-accent" : "text-ink-muted hover:text-ink"
                }`}
              >
                {t(tab.label)}
              </button>
            );
          })}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-accent transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
            style={{ left: indicator.left, width: indicator.width }}
          />
        </div>

        <button
          type="button"
          onClick={onExplain}
          aria-label={t("How Harbor Rank works")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink-subtle ring-1 ring-edge-soft transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
        >
          <Info size={17} strokeWidth={2} />
        </button>
      </div>

      <p
        key={source}
        className="pb-3 pt-1.5 text-[12.5px] text-ink-subtle animate-in fade-in duration-150 motion-reduce:animate-none"
      >
        {t(provenance)}
      </p>
    </div>
  );
}
