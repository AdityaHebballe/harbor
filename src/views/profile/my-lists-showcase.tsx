import { Check, ListVideo, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { Poster } from "@/components/poster";
import { Row } from "@/components/row";
import { addToList, createList, MAX_ITEMS } from "@/lib/custom-lists";
import { SectionHeader } from "./section-header";
import type { FeaturedItem, FeaturedList } from "@/lib/social/featured-lists";

function saveFeaturedList(list: FeaturedList): boolean {
  const id = createList(list.name || "Saved list");
  if (!id) return false;
  for (const it of list.items.slice(0, MAX_ITEMS)) {
    addToList(id, { id: it.id, type: it.type, name: it.name, poster: it.poster });
  }
  return true;
}

function SaveListButton({ list }: { list: FeaturedList }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const onSave = () => {
    if (state === "saving" || state === "saved") return;
    setState("saving");
    try {
      setState(saveFeaturedList(list) ? "saved" : "error");
    } catch {
      setState("error");
    }
  };
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={state === "saving" || state === "saved"}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold ring-1 transition-colors ${
        state === "saved"
          ? "bg-success/12 text-success ring-success/30"
          : state === "error"
            ? "bg-danger/12 text-danger ring-danger/30"
            : "bg-elevated text-ink-muted ring-edge-soft hover:bg-raised hover:text-ink"
      }`}
    >
      {state === "saving" ? (
        <Loader2 size={13} className="animate-spin" />
      ) : state === "saved" ? (
        <Check size={14} strokeWidth={2.6} />
      ) : (
        <Plus size={14} strokeWidth={2.4} />
      )}
      {state === "saved" ? "Saved" : state === "error" ? "List full" : "Save to my lists"}
    </button>
  );
}

function ListPoster({ item, onOpenMeta }: { item: FeaturedItem; onOpenMeta?: (id: string, kind?: string, hint?: { name?: string; poster?: string }) => void }) {
  return (
    <button
      onClick={() => onOpenMeta?.(item.id, item.type, { name: item.name, poster: item.poster })}
      disabled={!onOpenMeta}
      className="group w-full text-start disabled:cursor-default"
    >
      <Poster
        src={item.poster || undefined}
        seed={item.name || item.id}
        ratio="portrait"
        className="rounded-[10px] ring-1 ring-edge-soft shadow-[0_2px_8px_-2px_rgba(0,0,0,0.35)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0.24,1)] motion-safe:group-hover:will-change-transform group-hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,0.6)] motion-safe:group-hover:[transform:translate3d(0,-0.5rem,0)_scale(1.03)]"
        lazy
      />
      {item.name && <div className="mt-1.5 truncate text-[12px] text-ink-muted">{item.name}</div>}
    </button>
  );
}

export function MyListsShowcase({
  lists,
  isOwner,
  onOpenMeta,
  onViewAll,
  onManage,
  handle,
}: {
  lists: FeaturedList[];
  isOwner?: boolean;
  onOpenMeta?: (id: string, kind?: string, hint?: { name?: string; poster?: string }) => void;
  onViewAll?: () => void;
  onManage?: () => void;
  handle?: string;
}) {
  const shown = lists.filter((l) => l.items.length > 0);
  if (shown.length === 0 && !isOwner) {
    return (
      <section aria-label="My lists" className="rounded-[14px] bg-surface p-5 ring-1 ring-edge-soft">
        <SectionHeader icon={<ListVideo size={20} />} label="My lists" />
        <p className="py-6 text-center text-[13px] text-ink-subtle">
          This user hasn't featured any lists
        </p>
      </section>
    );
  }
  return (
    <section aria-label="My lists" className="rounded-[14px] bg-surface p-5 ring-1 ring-edge-soft">
      <SectionHeader
        icon={<ListVideo size={20} />}
        label="My lists"
        onViewAll={shown.length > 0 ? onViewAll : undefined}
      />
      {shown.length > 0 ? (
        <div className="space-y-5">
          {shown.map((list, i) => (
            <Row
              key={`${list.name}:${i}`}
              title={list.name || "Untitled list"}
              titleExtra={<span className="text-[12px] tabular-nums text-ink-subtle">{list.items.length}</span>}
              headerRight={!isOwner ? <SaveListButton list={list} /> : undefined}
              min={96}
              shape="portrait"
              scrollKey={handle ? `profile:${handle}:list:${i}` : undefined}
            >
              {list.items.map((item) => (
                <ListPoster key={item.id} item={item} onOpenMeta={onOpenMeta} />
              ))}
            </Row>
          ))}
          {isOwner && onManage && (
            <button
              onClick={onManage}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border border-edge-soft text-[13px] font-medium text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
            >
              <ListVideo size={18} /> Choose lists
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-edge py-10 text-center">
          <p className="text-[14px] text-ink-muted">No lists featured yet</p>
          <p className="mt-1 text-[12px] text-ink-subtle">Pick lists from your library to show them here</p>
          {onManage && (
            <button
              onClick={onManage}
              className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-ink px-5 text-[14px] font-semibold text-canvas transition-opacity hover:opacity-90"
            >
              <Plus size={18} /> Choose lists
            </button>
          )}
        </div>
      )}
    </section>
  );
}
