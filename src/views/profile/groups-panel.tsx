import { Plus, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useT } from "@/lib/i18n";
import { fetchMyGroups, type Group } from "@/lib/social/groups";
import { CreateGroupModal } from "./create-group-modal";
import { GroupCard } from "./group-card";
import { GroupDetailModal } from "./group-detail-modal";

export function GroupsPanel({
  isOwner,
  onOpenProfile,
}: {
  isOwner: boolean;
  onOpenProfile?: (handle: string) => void;
}) {
  const t = useT();
  const [groups, setGroups] = useState<Group[]>([]);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [createOpen, setCreateOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback((signal?: AbortSignal) => {
    setPhase("loading");
    fetchMyGroups(signal)
      .then((list) => {
        if (signal?.aborted) return;
        setGroups(list);
        setPhase("ready");
      })
      .catch(() => {
        if (signal?.aborted) return;
        setPhase("error");
      });
  }, []);

  useEffect(() => {
    if (!isOwner) return;
    const ctrl = new AbortController();
    load(ctrl.signal);
    return () => ctrl.abort();
  }, [isOwner, load]);

  if (!isOwner) return null;

  return (
    <section aria-label={t("Groups")} className="mt-6 rounded-[14px] bg-surface p-4 ring-1 ring-edge-soft">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
          <UsersRound size={20} /> {t("Groups")}
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-elevated px-3.5 text-[12px] font-semibold text-ink-muted ring-1 ring-edge-soft transition-colors hover:bg-raised hover:text-ink"
        >
          <Plus size={16} /> {t("Create")}
        </button>
      </div>

      {phase === "loading" ? (
        <p className="py-6 text-center text-[13px] text-ink-subtle">{t("Loading groups")}</p>
      ) : phase === "error" ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <p className="text-[13px] text-ink-subtle">{t("Could not load your groups.")}</p>
          <button
            onClick={() => load()}
            className="text-[12px] font-semibold text-accent transition-opacity hover:opacity-80"
          >
            {t("Try again")}
          </button>
        </div>
      ) : groups.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-ink-subtle">
          {t("Create a group to watch and share together.")}
        </p>
      ) : (
        <div className="harbor-scroll flex max-h-[380px] flex-col gap-0.5 overflow-y-auto pe-0.5">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} onOpen={setOpenId} />
          ))}
        </div>
      )}

      {createOpen && (
        <CreateGroupModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => load()}
        />
      )}
      {openId && (
        <GroupDetailModal
          id={openId}
          onClose={() => setOpenId(null)}
          onChanged={() => load()}
          onOpenProfile={onOpenProfile}
        />
      )}
    </section>
  );
}
