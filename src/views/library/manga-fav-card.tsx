import { Poster } from "@/components/poster";
import type { MangaFavEntry } from "@/lib/manga-favorites";
import { useView } from "@/lib/view";

export function MangaFavCard({ entry }: { entry: MangaFavEntry }) {
  const { openManga } = useView();
  return (
    <button
      type="button"
      onClick={() => openManga(entry.id)}
      className="group flex w-full min-w-0 flex-col gap-2.5 text-start"
    >
      <div className="relative w-full transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0.24,1)] group-hover:will-change-transform group-hover:[transform:translate3d(0,-0.5rem,0)]">
        <Poster
          src={entry.cover}
          seed={entry.id}
          ratio="portrait"
          className="harbor-card-ring rounded-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] transition-[box-shadow] duration-300 group-hover:shadow-[0_24px_48px_-14px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]"
        />
      </div>
      <p className="line-clamp-2 min-h-9 text-[13px] font-medium leading-snug text-ink">
        {entry.title}
      </p>
    </button>
  );
}
