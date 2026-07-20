import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { deleteComment, fetchComments, postComment, ProfileApiError } from "./profile-api";
import type { Comment, LoadState } from "./profile-types";
import { stripUrls, validateComment, type ComposeIssue } from "./text-safety";

export type CommentsController = {
  state: LoadState;
  comments: Comment[];
  cursor?: string;
  hasMore: boolean;
  loadMore: () => void;
  submit: (raw: string) => Promise<ComposeIssue>;
  remove: (id: string) => void;
  sending: boolean;
};

export function useComments(handle: string): CommentsController {
  const { authKey } = useAuth();
  const [state, setState] = useState<LoadState>("loading");
  const [comments, setComments] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [sending, setSending] = useState(false);
  const lastSentAt = useRef(0);

  useEffect(() => {
    if (!handle) return;
    const ac = new AbortController();
    setState("loading");
    setComments([]);
    setCursor(undefined);
    fetchComments(handle, undefined, ac.signal)
      .then((page) => {
        if (ac.signal.aborted) return;
        setComments(page.comments);
        setCursor(page.nextCursor);
        setHasMore(!!page.nextCursor);
        setState(page.comments.length ? "ready" : "empty");
      })
      .catch(() => !ac.signal.aborted && setState("error"));
    return () => ac.abort();
  }, [handle, authKey]);

  const loadMore = useCallback(() => {
    if (!cursor) return;
    void fetchComments(handle, cursor).then((page) => {
      setComments((cur) => [...cur, ...page.comments]);
      setCursor(page.nextCursor);
      setHasMore(!!page.nextCursor);
    });
  }, [handle, cursor, authKey]);

  const submit = useCallback(
    async (raw: string): Promise<ComposeIssue> => {
      const issue = validateComment(raw, lastSentAt.current, Date.now());
      if (issue) return issue;
      if (!authKey) return "spam";
      const clean = stripUrls(raw.trim());
      setSending(true);
      try {
        const created = await postComment(handle, clean);
        lastSentAt.current = Date.now();
        setComments((cur) => [created, ...cur]);
        setState("ready");
        return null;
      } catch (e) {
        return e instanceof ProfileApiError && e.status === 429 ? "cooldown" : "spam";
      } finally {
        setSending(false);
      }
    },
    [handle, authKey],
  );

  const remove = useCallback(
    (id: string) => {
      if (!authKey) return;
      const prev = comments;
      setComments((cur) => cur.filter((c) => c.id !== id));
      void deleteComment(handle, id).catch(() => setComments(prev));
    },
    [handle, authKey, comments],
  );

  return { state, comments, cursor, hasMore, loadMore, submit, remove, sending };
}
