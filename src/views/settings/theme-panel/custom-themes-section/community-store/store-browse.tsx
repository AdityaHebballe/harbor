import { useMemo, useState } from "react";
import type { StoreTheme } from "@/lib/theme-store";
import { ThemeCard } from "./theme-card";

const SORTS = [
  { id: "top", label: "Top rated" },
  { id: "downloads", label: "Most downloaded" },
  { id: "new", label: "Newest" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

function sortThemes(list: StoreTheme[], sort: SortId): StoreTheme[] {
  const copy = [...list];
  if (sort === "downloads") return copy.sort((a, b) => b.downloads - a.downloads);
  if (sort === "new") return copy.sort((a, b) => (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0));
  return copy.sort((a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount || b.downloads - a.downloads);
}

export function StoreBrowse({
  themes,
  query,
  onOpen,
}: {
  themes: StoreTheme[];
  query: string;
  onOpen: (t: StoreTheme) => void;
}) {
  const [sort, setSort] = useState<SortId>("top");
  const q = query.trim().toLowerCase();

  const shown = useMemo(() => {
    const filtered = q
      ? themes.filter((t) => `${t.name} ${t.author} ${t.blurb}`.toLowerCase().includes(q))
      : themes;
    return sortThemes(filtered, sort);
  }, [themes, q, sort]);

  return (
    <section className="flex flex-col gap-5 ps-[9px]">
      <div className="flex flex-wrap items-center gap-2">
        {SORTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSort(s.id)}
            className={`h-8 rounded-full border px-3.5 text-[12px] font-semibold transition-colors ${
              sort === s.id
                ? "border-ink bg-ink text-canvas"
                : "border-edge-soft bg-elevated/40 text-ink-muted hover:border-edge hover:text-ink"
            }`}
          >
            {s.label}
          </button>
        ))}
        <span className="ms-auto text-[12px] tabular-nums text-ink-subtle">
          {shown.length} {shown.length === 1 ? "theme" : "themes"}
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-[6px] border border-dashed border-edge px-4 py-14 text-center text-[13px] text-ink-subtle">
          {q ? "No themes match your search." : "No community themes yet. Be the first to share one."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((t) => (
            <ThemeCard key={t.id} theme={t} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}
