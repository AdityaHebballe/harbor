import { ChevronRight } from "lucide-react";
import { Avatar } from "./profile-bits";
import type { Group } from "@/lib/social/groups";

export function GroupCard({ group, onOpen }: { group: Group; onOpen: (id: string) => void }) {
  return (
    <button
      onClick={() => onOpen(group.id)}
      className="flex w-full min-h-11 items-center gap-3 rounded-[10px] px-2 py-1.5 text-start transition-colors hover:bg-elevated"
    >
      <Avatar src={group.avatarUrl} size={40} alias={group.name} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-ink">{group.name}</div>
        <div className="truncate text-[12px] text-ink-subtle">
          {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
        </div>
      </div>
      <ChevronRight size={18} className="shrink-0 text-ink-subtle" aria-hidden />
    </button>
  );
}
