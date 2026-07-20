import type { StoreTheme } from "@/lib/theme-store";
import type { StoreData } from "./use-store-themes";
import { StoreHero } from "./store-hero";
import { StoreRail } from "./store-rail";
import { TopAuthors } from "./top-authors";

export function StoreDiscover({
  data,
  onOpen,
  onAuthor,
  onBrowseAll,
}: {
  data: StoreData;
  onOpen: (t: StoreTheme) => void;
  onAuthor: (author: string) => void;
  onBrowseAll: () => void;
}) {
  return (
    <div className="flex flex-col gap-12">
      {data.hero && <StoreHero theme={data.hero} label="Featured theme" onOpen={onOpen} />}
      <StoreRail
        title="Top rated"
        subtitle="The community's highest-rated"
        themes={data.topRated.slice(0, 20)}
        ranked
        scrollKey="themestore:toprated"
        onOpen={onOpen}
        onViewAll={onBrowseAll}
      />
      <StoreRail
        title="Most popular"
        subtitle="Most downloaded right now"
        themes={data.popular.slice(0, 20)}
        scrollKey="themestore:popular"
        onOpen={onOpen}
        onViewAll={onBrowseAll}
      />
      <StoreRail
        title="Fresh drops"
        subtitle="Just shared by the community"
        themes={data.fresh.slice(0, 20)}
        scrollKey="themestore:fresh"
        onOpen={onOpen}
        onViewAll={onBrowseAll}
      />
      <TopAuthors authors={data.authors} onSelect={onAuthor} />
      {data.moodRails.map((r) => (
        <StoreRail
          key={r.mood}
          title={r.title}
          subtitle={r.blurb}
          themes={r.items.slice(0, 16)}
          scrollKey={`themestore:mood-${r.mood}`}
          onOpen={onOpen}
          onViewAll={onBrowseAll}
        />
      ))}
    </div>
  );
}
