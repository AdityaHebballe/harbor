import { useEffect, useState } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import { currentAuthor, subscribeAuthor } from "@/lib/theme-auth";
import { useComments } from "./use-comments";
import { CommentComposer } from "./comment-composer";
import { CommentItem } from "./comment-item";

export function CommentsSection({ themeId }: { themeId: string }) {
  const { comments, loading, error, add, remove } = useComments(themeId);
  const [author, setAuthor] = useState(currentAuthor());
  useEffect(() => subscribeAuthor(() => setAuthor(currentAuthor())), []);

  return (
    <section className="flex flex-col gap-4">
      <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink">
        <MessageSquare size={16} className="text-ink-subtle" />
        Comments
        {comments.length > 0 && <span className="text-ink-subtle tabular-nums">{comments.length}</span>}
      </h3>

      {author ? (
        <CommentComposer onSubmit={add} />
      ) : (
        <p className="rounded-[6px] border border-dashed border-edge bg-surface/40 px-4 py-5 text-center text-[13px] text-ink-subtle">
          Sign in from the My themes tab to join the conversation.
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-6 text-ink-subtle">
          <Loader2 size={18} className="animate-spin" />
        </div>
      ) : error ? (
        <p className="text-[13px] text-danger">{error}</p>
      ) : comments.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-ink-subtle">No comments yet. Start the conversation.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} onDelete={remove} />
          ))}
        </div>
      )}
    </section>
  );
}
