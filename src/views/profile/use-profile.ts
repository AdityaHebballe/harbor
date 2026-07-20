import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { currentAuthor, subscribeAuthor } from "@/lib/theme-auth";
import { fetchActivity, fetchBadges, fetchFriends, fetchSummary, ProfileNotFound } from "./profile-api";
import type { ActivityItem, Badge, Friend, LoadState, ProfileSummary } from "./profile-types";

export type ProfileBundle = {
  state: LoadState;
  summary: ProfileSummary | null;
  friends: Friend[];
  badges: Badge[];
  activity: ActivityItem[];
  reload: () => void;
  patchSummary: (next: ProfileSummary) => void;
};

export function useProfile(handle: string): ProfileBundle {
  const { authKey } = useAuth();
  const [authorId, setAuthorId] = useState(() => currentAuthor()?.id ?? "");
  const [state, setState] = useState<LoadState>("loading");
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const patchSummary = useCallback((next: ProfileSummary) => setSummary(next), []);

  useEffect(() => subscribeAuthor(() => setAuthorId(currentAuthor()?.id ?? "")), []);

  useEffect(() => {
    if (!handle) return;
    const ac = new AbortController();
    setState("loading");
    setSummary(null);
    setFriends([]);
    setBadges([]);
    setActivity([]);
    fetchSummary(handle, ac.signal)
      .then((s) => {
        if (ac.signal.aborted) return;
        setSummary(s);
        setState("ready");
        void fetchFriends(handle, ac.signal).then((f) => !ac.signal.aborted && setFriends(f)).catch(() => {});
        void fetchBadges(handle, ac.signal).then((b) => !ac.signal.aborted && setBadges(b)).catch(() => {});
        void fetchActivity(handle, ac.signal).then((a) => !ac.signal.aborted && setActivity(a)).catch(() => {});
      })
      .catch((e) => {
        if (ac.signal.aborted) return;
        setState(e instanceof ProfileNotFound ? "empty" : "error");
      });
    return () => ac.abort();
  }, [handle, authKey, authorId, nonce]);

  return { state, summary, friends, badges, activity, reload, patchSummary };
}
