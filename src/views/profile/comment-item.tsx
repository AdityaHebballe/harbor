import { Trash2 } from "lucide-react";
import { Avatar, timeAgo } from "./profile-bits";
import { segmentProfanity } from "./text-safety";
import { UserHoverCard } from "./user-hover-card";
import { useSelfAvatar } from "./use-self-avatar";
import type { Comment } from "./profile-types";

function SafeBody({ body }: { body: string }) {
  const segments = segmentProfanity(body);
  return (
    <p className="mt-1 whitespace-pre-wrap break-words text-[14px] leading-relaxed text-ink-muted">
      {segments.map((s, i) =>
        s.masked ? (
          <span
            key={i}
            title="Hidden language"
            className="cursor-default rounded-[4px] bg-elevated px-1 blur-[5px] transition-[filter] duration-150 hover:blur-0"
          >
            {s.text}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </p>
  );
}

export function CommentItem({
  c,
  canDelete,
  onDelete,
  onOpenAuthor,
}: {
  c: Comment;
  canDelete: boolean;
  onDelete: (id: string) => void;
  onOpenAuthor?: (handle: string) => void;
}) {
  const self = useSelfAvatar();
  const mine = !!self.handle && self.handle.toLowerCase() === c.authorHandle.toLowerCase();
  const avatarSrc = mine ? self.avatar ?? c.authorAvatarUrl : c.authorAvatarUrl;
  const avatarFallback = mine ? c.authorAvatarUrl : undefined;
  return (
    <div className="group flex gap-3 rounded-[10px] p-2 transition-colors hover:bg-elevated/60">
      <UserHoverCard handle={c.authorHandle}>
        <button
          onClick={() => onOpenAuthor?.(c.authorHandle)}
          aria-label={`Open ${c.authorAlias} profile`}
          className="shrink-0"
        >
          <Avatar src={avatarSrc} fallbackSrc={avatarFallback} size={36} alias={c.authorAlias} />
        </button>
      </UserHoverCard>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <UserHoverCard handle={c.authorHandle}>
            <button
              onClick={() => onOpenAuthor?.(c.authorHandle)}
              className="min-w-0 truncate text-[13px] font-semibold text-ink hover:text-accent"
            >
              {c.authorAlias}
            </button>
          </UserHoverCard>
          <span className="shrink-0 text-[12px] text-ink-subtle">@{c.authorHandle}</span>
          <span className="shrink-0 text-[12px] text-ink-subtle">·</span>
          <span className="shrink-0 text-[12px] text-ink-subtle">{timeAgo(c.at)}</span>
          {c.flagged && (
            <span className="rounded-[4px] bg-surface px-1.5 text-[10px] uppercase tracking-[0.08em] text-ink-subtle">
              Filtered
            </span>
          )}
        </div>
        <SafeBody body={c.body} />
      </div>
      {canDelete && (
        <button
          onClick={() => onDelete(c.id)}
          aria-label="Delete comment"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-ink-subtle opacity-0 transition-all hover:bg-surface hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Trash2 size={20} />
        </button>
      )}
    </div>
  );
}
