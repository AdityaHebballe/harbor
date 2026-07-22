import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { type PeopleDept } from "@/lib/harbor-rank";
import { useT } from "@/lib/i18n";

const DEPTS: Array<{ id: PeopleDept; label: string }> = [
  { id: "Acting", label: "Actors" },
  { id: "Directing", label: "Directors" },
  { id: "Production", label: "Producers" },
  { id: "Writing", label: "Writers" },
];

export function PeopleFilterBar({
  dept,
  onDept,
  country,
  onCountry,
  query,
  onQuery,
  countries,
  onExplain,
}: {
  dept: PeopleDept;
  onDept: (d: PeopleDept) => void;
  country: string | null;
  onCountry: (iso: string | null) => void;
  query: string;
  onQuery: (q: string) => void;
  countries: Array<{ iso: string; name: string }>;
  onExplain: () => void;
}) {
  const t = useT();
  const listRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [ind, setInd] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const el = btnRefs.current[dept];
      const wrap = listRef.current;
      if (!el || !wrap) return;
      const e = el.getBoundingClientRect();
      const w = wrap.getBoundingClientRect();
      const left = e.left - w.left;
      const width = e.width;
      setInd((prev) => (prev.left === left && prev.width === width ? prev : { left, width }));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [dept]);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 bg-canvas/80 py-3 backdrop-blur-sm">
      <div
        ref={listRef}
        role="tablist"
        aria-label={t("Department")}
        className="relative flex items-center gap-1"
      >
        {DEPTS.map((d) => {
          const active = d.id === dept;
          return (
            <button
              key={d.id}
              ref={(el) => {
                btnRefs.current[d.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onDept(d.id)}
              className={`flex h-11 items-center px-3 text-[13px] font-semibold tracking-tight transition-colors motion-reduce:transition-none ${
                active ? "text-accent" : "text-ink-muted hover:text-ink"
              }`}
            >
              {t(d.label)}
            </button>
          );
        })}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-accent transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
          style={{ left: ind.left, width: ind.width }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 ms-auto">
        <div className="flex flex-col gap-1">
          <div className="relative">
            <select
              value={country ?? ""}
              onChange={(e) => onCountry(e.target.value || null)}
              aria-label={t("Country")}
              className="h-11 min-w-[176px] appearance-none rounded-lg bg-surface ps-3 pe-9 text-[13px] text-ink outline-none ring-1 ring-edge-soft transition-shadow focus:ring-ink-subtle motion-reduce:transition-none"
            >
              <option value="">{t("All countries")}</option>
              {countries.map((c) => (
                <option key={c.iso} value={c.iso}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              strokeWidth={2}
              aria-hidden
              className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-ink-subtle"
            />
          </div>
          <span className="ps-1 text-[11px] text-ink-subtle">{t("Birthplace, not nationality")}</span>
        </div>

        <div className="flex h-11 items-center gap-2 rounded-full bg-canvas/60 px-3.5 ring-1 ring-edge-soft transition-shadow focus-within:ring-ink-subtle motion-reduce:transition-none">
          <Search size={14} className="text-ink-subtle" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t("Filter by name or title")}
            spellCheck={false}
            className="h-full w-52 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-subtle/60"
          />
        </div>

        <button
          type="button"
          onClick={onExplain}
          className="flex h-11 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] text-ink-muted transition-colors hover:text-ink motion-reduce:transition-none"
        >
          <HelpCircle size={15} strokeWidth={2} />
          {t("How Harbor Rank works")}
        </button>
      </div>
    </div>
  );
}
