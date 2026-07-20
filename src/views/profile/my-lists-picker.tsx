import { Check, ListVideo, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Poster } from "@/components/poster";
import { useCustomLists } from "@/lib/custom-lists";
import { currentAuthor } from "@/lib/theme-auth";
import {
  MAX_FEATURED_LISTS,
  fetchFeaturedLists,
  readLocalLists,
  saveFeaturedLists,
  toFeaturedList,
  toPickableList,
  type FeaturedList,
  type PickableList,
} from "@/lib/social/featured-lists";

function normName(value: string): string {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
}

function matchSelection(featured: FeaturedList[], lists: PickableList[]): string[] {
  const byName = new Map<string, string>();
  for (const list of lists) {
    const key = normName(list.name);
    if (!byName.has(key)) byName.set(key, list.id);
  }
  const ids: string[] = [];
  for (const f of featured) {
    const id = byName.get(normName(f.name));
    if (id && !ids.includes(id)) ids.push(id);
  }
  return ids.slice(0, MAX_FEATURED_LISTS);
}

function ListRow({
  list,
  selected,
  disabled,
  onToggle,
}: {
  list: PickableList;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-[10px] p-2.5 text-start ring-1 transition-colors disabled:opacity-40 ${
        selected ? "bg-elevated ring-edge" : "ring-edge-soft hover:bg-elevated"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          selected ? "bg-accent text-canvas" : "ring-1 ring-edge"
        }`}
      >
        {selected && <Check size={16} strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-ink">{list.name}</div>
        <div className="text-[12px] text-ink-subtle">
          {list.items.length} {list.items.length === 1 ? "title" : "titles"}
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        {list.items.slice(0, 4).map((item) => (
          <div key={item.id} className="w-8">
            <Poster src={item.poster || undefined} seed={item.name || item.id} ratio="portrait" className="rounded-[6px]" />
          </div>
        ))}
      </div>
    </button>
  );
}

export function MyListsPicker({ onClose }: { onClose?: () => void }) {
  const local = useCustomLists();
  const lists = useMemo(() => local.map(toPickableList), [local]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = currentAuthor()?.handle;
    if (!handle) return;
    const ctrl = new AbortController();
    fetchFeaturedLists(handle, ctrl.signal)
      .then((featured) => setSelected(matchSelection(featured, readLocalLists())))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (id: string) => {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX_FEATURED_LISTS) return cur;
      return [...cur, id];
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const byId = new Map(lists.map((l) => [l.id, l] as const));
      const payload = selected
        .map((id) => byId.get(id))
        .filter((l): l is PickableList => !!l)
        .map(toFeaturedList);
      await saveFeaturedLists(payload);
      onClose?.();
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="dialog" aria-modal>
      <button aria-label="Close" className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-[20px] bg-surface ring-1 ring-edge">
        <div className="flex items-center justify-between border-b border-edge-soft px-6 py-4">
          <h2 className="font-display text-[20px] text-ink">Featured lists</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-[10px] text-ink-muted hover:bg-elevated"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-6 py-5">
          <p className="pb-1 text-[13px] text-ink-muted">
            Pick up to {MAX_FEATURED_LISTS} lists to show on your public profile.
          </p>
          {lists.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-edge py-12 text-center">
              <ListVideo size={24} className="text-ink-subtle" />
              <p className="mt-2 text-[14px] text-ink-muted">You have no lists yet</p>
              <p className="mt-1 text-[12px] text-ink-subtle">Create lists in your library to feature them here</p>
            </div>
          ) : (
            lists.map((list) => (
              <ListRow
                key={list.id}
                list={list}
                selected={selected.includes(list.id)}
                disabled={!selected.includes(list.id) && selected.length >= MAX_FEATURED_LISTS}
                onToggle={() => toggle(list.id)}
              />
            ))
          )}
          {error && <p className="text-[13px] text-danger">{error}</p>}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-edge-soft px-6 py-4">
          <span className="text-[13px] tabular-nums text-ink-subtle">
            {selected.length}/{MAX_FEATURED_LISTS} selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex min-h-11 items-center rounded-[10px] px-4 text-[14px] font-medium text-ink-muted hover:bg-elevated"
            >
              Cancel
            </button>
            <button
              onClick={() => void save()}
              disabled={saving}
              className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-accent px-5 text-[14px] font-semibold text-canvas transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Check size={20} /> {saving ? "Saving" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
