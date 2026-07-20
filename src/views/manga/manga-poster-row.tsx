import { useRef } from "react";
import { Poster } from "@/components/poster";
import { RailChevron } from "@/components/nav-arrow";
import type { MangaSummary } from "@/lib/manga/types";

export function MangaPosterRow({
  items,
  onOpen,
  award = false,
  art,
}: {
  items: MangaSummary[] | null;
  onOpen: (item: MangaSummary) => void;
  award?: boolean;
  art?: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nudge = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 420, behavior: "smooth" });

  if (items && items.length === 0) return null;

  return (
    <div className="group/coll relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-1 pb-3 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x proximity" }}
      >
        {items === null
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-36 shrink-0 animate-pulse motion-reduce:animate-none">
                <div className="aspect-[2/3] w-full rounded-xl bg-elevated/60" />
                <div className="mt-2 h-3.5 w-4/5 rounded bg-elevated/50" />
              </div>
            ))
          : items.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onOpen(m)}
                style={{ scrollSnapAlign: "start" }}
                className="group flex w-36 shrink-0 flex-col gap-2 text-start"
              >
                <div className="relative w-full transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0.24,1)] group-hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                  <Poster
                    src={m.cover}
                    seed={m.id}
                    ratio="portrait"
                    lazy
                    className="harbor-card-ring rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] transition-[box-shadow] duration-300 group-hover:shadow-[0_24px_48px_-14px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]"
                  />
                  {award && art && (
                    <img
                      src={art}
                      alt=""
                      draggable={false}
                      className="pointer-events-none absolute start-1.5 top-1.5 h-8 w-auto object-contain drop-shadow-[0_3px_9px_rgba(0,0,0,0.6)]"
                    />
                  )}
                </div>
                <p className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">{m.title}</p>
              </button>
            ))}
      </div>
      {items && items.length > 5 && (
        <>
          <RailChevron side="left" visible onClick={() => nudge(-1)} outset={44} nudgeY={-12} />
          <RailChevron side="right" visible onClick={() => nudge(1)} outset={44} nudgeY={-12} />
        </>
      )}
    </div>
  );
}
