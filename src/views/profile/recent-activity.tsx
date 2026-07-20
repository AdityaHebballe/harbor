import { Clapperboard, Heart, Star, Trophy } from "lucide-react";
import { Poster } from "@/components/poster";
import { Row } from "@/components/row";
import { SectionHeader } from "./section-header";
import { timeAgo } from "./profile-bits";
import type { ActivityItem, ActivityKind } from "./profile-types";

export const ACTIVITY_VERB: Record<ActivityKind, string> = {
  watched: "Watched",
  finished: "Finished",
  rated: "Rated",
  favorited: "Favorited",
};

export function ActivityGlyph({ kind, size = 16 }: { kind: ActivityKind; size?: number }) {
  switch (kind) {
    case "watched":
      return <Clapperboard size={size} className="text-ink-muted" />;
    case "finished":
      return <Trophy size={size} className="text-accent" />;
    case "rated":
      return <Star size={size} className="text-accent" />;
    case "favorited":
      return <Heart size={size} className="text-danger" />;
  }
}

function ActivityCard({ a, onOpen }: { a: ActivityItem; onOpen?: (metaId: string, kind?: string, hint?: { name?: string; poster?: string }) => void }) {
  return (
    <button
      onClick={() => a.metaId && onOpen?.(a.metaId, undefined, { name: a.title, poster: a.posterUrl })}
      disabled={!a.metaId}
      className="group w-full text-start disabled:cursor-default"
    >
      <Poster
        src={a.posterUrl}
        seed={a.title}
        ratio="portrait"
        className="rounded-[10px] ring-1 ring-edge-soft shadow-[0_2px_8px_-2px_rgba(0,0,0,0.35)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0.24,1)] motion-safe:group-hover:will-change-transform group-hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,0.6)] motion-safe:group-hover:[transform:translate3d(0,-0.5rem,0)_scale(1.03)]"
        lazy
      />
      <div className="mt-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-ink-subtle">
        <ActivityGlyph kind={a.kind} size={13} />
        {ACTIVITY_VERB[a.kind]}
        {a.kind === "rated" && a.rating !== undefined && <span className="text-accent">{a.rating}/10</span>}
      </div>
      <div className="mt-0.5 truncate text-[13px] font-medium text-ink">{a.title}</div>
      <div className="mt-0.5 text-[11px] tabular-nums text-ink-subtle">{timeAgo(a.at)}</div>
    </button>
  );
}

export function RecentActivity({
  items,
  onOpen,
  onViewAll,
  handle,
  visibilityPrivate = false,
}: {
  items: ActivityItem[];
  onOpen?: (metaId: string, kind?: string, hint?: { name?: string; poster?: string }) => void;
  onViewAll?: () => void;
  handle?: string;
  visibilityPrivate?: boolean;
}) {
  return (
    <section aria-label="Recent activity" className="rounded-[14px] bg-surface p-5 ring-1 ring-edge-soft">
      <SectionHeader
        icon={<Clapperboard size={20} />}
        label="Recent activity"
        onViewAll={!visibilityPrivate && items.length > 0 ? onViewAll : undefined}
      />
      {visibilityPrivate ? (
        <p className="py-6 text-center text-[13px] text-ink-subtle">This user has chosen to keep activity private</p>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-ink-subtle">No recent activity yet</p>
      ) : (
        <Row min={150} shape="portrait" scrollKey={handle ? `profile:${handle}:activity` : undefined}>
          {items.map((a) => (
            <ActivityCard key={a.id} a={a} onOpen={onOpen} />
          ))}
        </Row>
      )}
    </section>
  );
}
