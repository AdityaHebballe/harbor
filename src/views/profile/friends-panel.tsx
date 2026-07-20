import { UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { AddFriendsModal } from "./add-friends-modal";
import { Avatar } from "./profile-bits";
import { UserHoverCard } from "./user-hover-card";
import type { Friend } from "./profile-types";

const FRIENDS_PAGE = 6;
const FRIENDS_STEP = 12;

function FriendRow({ f, onOpen }: { f: Friend; onOpen?: (h: string) => void }) {
  return (
    <UserHoverCard handle={f.handle}>
      <button
        onClick={() => onOpen?.(f.handle)}
        className="flex w-full min-h-11 items-center gap-3 rounded-[10px] px-2 py-1.5 text-start transition-colors hover:bg-elevated"
      >
        <Avatar src={f.avatarUrl} size={40} online={f.online} alias={f.alias} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-medium text-ink">{f.alias}</div>
          <div className="truncate text-[12px] text-ink-subtle">{f.slogan || `@${f.handle}`}</div>
        </div>
      </button>
    </UserHoverCard>
  );
}

export function FriendsPanel({
  friends,
  onOpen,
  isOwner = false,
}: {
  friends: Friend[];
  onOpen?: (h: string) => void;
  isOwner?: boolean;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [shown, setShown] = useState(FRIENDS_PAGE);
  const online = friends.filter((f) => f.online);
  const offline = friends.filter((f) => !f.online);
  const ordered = [...online, ...offline];
  const visible = ordered.slice(0, shown);
  const vOnline = visible.filter((f) => f.online);
  const vOffline = visible.filter((f) => !f.online);
  const remaining = ordered.length - visible.length;
  return (
    <section aria-label="Friends" className="rounded-[14px] bg-surface p-4 ring-1 ring-edge-soft">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
          <Users size={20} /> Friends
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-elevated px-3 text-[12px] font-semibold text-ink-muted ring-1 ring-edge-soft transition-colors hover:bg-raised hover:text-ink"
            >
              <UserPlus size={14} /> Add
            </button>
          )}
          <span className="text-[12px] tabular-nums text-ink-subtle">
            <span className="text-success">{online.length}</span> / {friends.length}
          </span>
        </div>
      </div>
      {friends.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-ink-subtle">
          {isOwner ? "Add friends to see them here." : "No friends to show yet"}
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex max-h-[440px] flex-col gap-0.5 overflow-y-auto [scrollbar-width:thin]">
            {vOnline.length > 0 && (
              <div className="px-2 pb-1 pt-0.5 text-[11px] uppercase tracking-[0.1em] text-success">
                Online now
              </div>
            )}
            {vOnline.map((f) => (
              <FriendRow key={f.handle} f={f} onOpen={onOpen} />
            ))}
            {vOffline.length > 0 && (
              <div className="px-2 pb-1 pt-3 text-[11px] uppercase tracking-[0.1em] text-ink-subtle">
                Offline
              </div>
            )}
            {vOffline.map((f) => (
              <FriendRow key={f.handle} f={f} onOpen={onOpen} />
            ))}
          </div>
          {remaining > 0 && (
            <button
              onClick={() => setShown((s) => s + FRIENDS_STEP)}
              className="min-h-9 rounded-[10px] text-[12.5px] font-medium text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
            >
              Show {Math.min(remaining, FRIENDS_STEP)} more
            </button>
          )}
        </div>
      )}
      {isOwner && addOpen && (
        <AddFriendsModal
          onClose={() => setAddOpen(false)}
          existingHandles={friends.map((f) => f.handle)}
        />
      )}
    </section>
  );
}
