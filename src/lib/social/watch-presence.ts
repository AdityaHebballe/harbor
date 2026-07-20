import { useEffect } from "react";
import { subscribeActivity, type ActivityState } from "@/lib/discord/presence";
import { safeFetch } from "@/lib/safe-fetch";
import { useSettings } from "@/lib/settings";
import { authToken } from "@/lib/theme-auth";

const ENDPOINT = "https://harbor.site/themes/api/social/me/profile";
const DEBOUNCE_MS = 2500;
const HEARTBEAT_MS = 240000;

type WatchingPayload = {
  kind: "watching" | "party";
  title?: string;
  sub?: string;
  posterUrl?: string;
  partySize?: number;
  paused?: boolean;
  startedAt?: number;
};

let enabled = false;
let current: WatchingPayload | null = null;
let startedAt = 0;
let lastSentKey = "";
let hasShared = false;
let debounceTimer: number | null = null;

function buildPayload(s: ActivityState): WatchingPayload | null {
  const partySize = s.party ? Math.max(1, s.party.size) : 0;
  if (s.playback) {
    const sub = s.playback.subtitle || (s.playback.year ? String(s.playback.year) : "");
    return {
      kind: partySize ? "party" : "watching",
      title: s.playback.title.slice(0, 120),
      sub: sub ? sub.slice(0, 60) : undefined,
      posterUrl:
        s.playback.posterUrl && /^https:\/\//i.test(s.playback.posterUrl)
          ? s.playback.posterUrl.slice(0, 300)
          : undefined,
      partySize: partySize || undefined,
      paused: s.playback.paused || undefined,
    };
  }
  if (partySize) return { kind: "party", partySize };
  return null;
}

async function push(payload: WatchingPayload | null): Promise<void> {
  const token = authToken();
  if (!token) return;
  await safeFetch(ENDPOINT, {
    method: "PATCH",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ watching: payload }),
  });
}

function send(force = false): void {
  const payload = current ? { ...current, startedAt: startedAt || undefined } : null;
  const key = JSON.stringify(payload);
  if (!force && key === lastSentKey) return;
  if (payload === null && !hasShared) {
    lastSentKey = key;
    return;
  }
  lastSentKey = key;
  if (payload) hasShared = true;
  void push(payload).catch(() => {
    lastSentKey = "";
  });
}

function onActivity(s: ActivityState): void {
  const next = enabled ? buildPayload(s) : null;
  if (next && !current) startedAt = Date.now();
  if (!next) startedAt = 0;
  current = next;
  if (debounceTimer != null) window.clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => send(), DEBOUNCE_MS);
}

export function useWatchShare(): void {
  const { settings } = useSettings();
  const on = settings.shareWatchPresence;
  useEffect(() => {
    enabled = on;
    if (!on) {
      current = null;
      startedAt = 0;
      if (debounceTimer != null) window.clearTimeout(debounceTimer);
      send();
      return;
    }
    const offActivity = subscribeActivity(onActivity);
    const beat = window.setInterval(() => {
      if (current) send(true);
    }, HEARTBEAT_MS);
    return () => {
      offActivity();
      window.clearInterval(beat);
    };
  }, [on]);
}
