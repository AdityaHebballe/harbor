import { MessageSquare } from "lucide-react";
import { CommentCompose } from "./comment-compose";
import { CommentItem } from "./comment-item";
import { useComments } from "./use-comments";

export function CommentsSection({
  handle,
  isOwner,
  signedIn,
  onOpenAuthor,
}: {
  handle: string;
  isOwner: boolean;
  signedIn: boolean;
  onOpenAuthor?: (h: string) => void;
}) {
  const { state, comments, hasMore, loadMore, submit, remove, sending } = useComments(handle);
  return (
    <section aria-label="Comments" className="rounded-[14px] bg-surface p-5 ring-1 ring-edge-soft">
      <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
        <MessageSquare size={20} /> Comments
        {comments.length > 0 && <span className="tabular-nums text-ink-subtle">({comments.length})</span>}
      </div>

      <div className="mb-4">
        <CommentCompose onSubmit={submit} sending={sending} disabled={!signedIn} />
      </div>

      {state === "loading" && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 p-2">
              <div className="h-9 w-9 shrink-0 rounded-full bg-elevated" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 rounded bg-elevated" />
                <div className="h-3 w-4/5 rounded bg-elevated" />
              </div>
            </div>
          ))}
        </div>
      )}

      {state === "error" && (
        <p className="py-6 text-center text-[13px] text-ink-subtle">Could not load comments</p>
      )}

      {state === "empty" && (
        <p className="py-6 text-center text-[13px] text-ink-subtle">
          No comments yet. Be the first to say hello.
        </p>
      )}

      {state === "ready" && (
        <div className="flex flex-col gap-1">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              c={c}
              canDelete={isOwner}
              onDelete={remove}
              onOpenAuthor={onOpenAuthor}
            />
          ))}
          {hasMore && (
            <button
              onClick={loadMore}
              className="mx-auto mt-2 inline-flex min-h-11 items-center rounded-[10px] bg-elevated px-5 text-[13px] font-medium text-ink-muted ring-1 ring-edge-soft transition-colors hover:bg-raised"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </section>
  );
}
