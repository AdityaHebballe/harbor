import { Check, ImagePlus, Loader2, MapPin, Play, Settings2, Share2, UserMinus, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { ShareModal } from "./share-modal";
import { countryFlagSrc } from "@/components/flag";
import { acceptFriend, removeFriend, sendFriendRequest } from "@/lib/social/friends";
import { PRESENCE_META, useMyPresence } from "@/lib/social/presence";
import { countryName } from "./flags";
import { saveSlogan } from "./profile-api";
import { Avatar, compactNumber, FeaturedBadge, StatPill, VerifiedCheck } from "./profile-bits";
import { StatusBubble } from "./status-bubble";
import type { ProfileSummary } from "./profile-types";

type HeroBadge = { id: string; name: string; iconUrl?: string };

export function ProfileHero({
  p,
  avatar,
  avatarFallback,
  mangaReadOverride,
  watchedOverride,
  badges,
  userFont,
  onEdit,
  onPatch,
}: {
  p: ProfileSummary;
  avatar?: string;
  avatarFallback?: string;
  mangaReadOverride?: number;
  watchedOverride?: number;
  badges?: HeroBadge[];
  userFont?: string;
  onEdit?: () => void;
  onPatch?: (next: ProfileSummary) => void;
}) {
  const nameFont = userFont ? { fontFamily: `"${userFont}", var(--font-display)` } : undefined;
  const nameBadges = (badges ?? []).filter((b) => b.iconUrl && b.name.toLowerCase() !== "verified").slice(0, 6);
  const [sharing, setSharing] = useState(false);
  const myStatus = useMyPresence();
  const meta = PRESENCE_META[myStatus];
  const dotClass = p.isOwner ? meta.dot : p.online ? "bg-success" : "bg-ink-subtle";
  const presenceLabel = p.isOwner
    ? myStatus === "online"
      ? "Online now"
      : meta.label
    : p.online
      ? "Online now"
      : "Offline";
  const presenceText = p.isOwner ? meta.text : p.online ? "text-success" : "";
  return (
    <header className="relative w-full overflow-hidden">
      <div className="relative h-48 w-full sm:h-60">
        {p.bannerUrl ? (
          <img src={p.bannerUrl} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: "linear-gradient(135deg, var(--color-elevated), var(--color-surface) 55%, var(--color-canvas))" }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 28%, var(--color-canvas))" }}
        />
        {p.isOwner && !p.bannerUrl && onEdit && (
          <button
            onClick={onEdit}
            className="absolute end-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-elevated/70 px-3 py-1.5 text-[12px] font-medium text-ink ring-1 ring-edge-soft backdrop-blur transition-colors hover:bg-elevated"
          >
            <ImagePlus size={14} /> Add background
          </button>
        )}
      </div>

      <div className="relative mx-auto -mt-20 w-full max-w-6xl px-6 pb-6 lg:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative flex h-[124px] w-[124px] shrink-0">
            <Avatar src={avatar} fallbackSrc={avatarFallback} size={124} dotClass={dotClass} alias={p.alias} />
            <StatusBubble
              slogan={p.slogan}
              isOwner={p.isOwner}
              onSave={async (next) => {
                const s = await saveSlogan(next);
                onPatch?.(s);
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[30px] leading-tight text-ink" style={nameFont}>{p.alias}</h1>
              {p.verified && <VerifiedCheck size={22} />}
              {nameBadges.map((b) => (
                <HeroBadge key={b.id} badge={b} />
              ))}
              {p.featured && <FeaturedBadge />}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-subtle">
              <span className="text-ink-muted">@{p.handle}</span>
              <span className={presenceText}>{presenceLabel}</span>
              {p.location && (
                <span className="inline-flex items-center gap-1.5">
                  {countryFlagSrc(p.location) ? (
                    <img
                      src={countryFlagSrc(p.location) ?? ""}
                      alt=""
                      draggable={false}
                      className="shrink-0"
                      style={{ height: 12, width: 18, borderRadius: 2, objectFit: "cover" }}
                    />
                  ) : (
                    <MapPin size={13} />
                  )}
                  {countryName(p.location)}
                </span>
              )}
            </div>
            {p.watching && (
              <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-full bg-elevated/85 py-1 pe-3.5 ps-1 ring-1 ring-edge-soft">
                {p.watching.posterUrl ? (
                  <img
                    src={p.watching.posterUrl}
                    alt=""
                    draggable={false}
                    className="h-6 w-6 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-raised">
                    {p.watching.kind === "party" ? (
                      <Users size={11} strokeWidth={2.6} className="text-ink-muted" />
                    ) : (
                      <Play size={11} strokeWidth={2.6} className="text-ink-muted" />
                    )}
                  </span>
                )}
                <span className="truncate text-[12.5px] text-ink-muted">
                  {p.watching.kind === "party" ? (
                    <>
                      In a watch party
                      {p.watching.partySize ? ` · ${p.watching.partySize} aboard` : ""}
                      {p.watching.title ? (
                        <>
                          {" · "}
                          <span className="text-ink">{p.watching.title}</span>
                        </>
                      ) : null}
                    </>
                  ) : (
                    <>
                      {p.watching.paused ? "Paused on " : "Watching "}
                      <span className="text-ink">{p.watching.title ?? "something"}</span>
                      {p.watching.sub ? ` · ${p.watching.sub}` : ""}
                    </>
                  )}
                </span>
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {p.isOwner && onEdit ? (
              <>
                <button
                  onClick={() => setSharing(true)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-surface px-4 text-[14px] font-medium text-ink ring-1 ring-edge transition-colors hover:bg-raised"
                >
                  <Share2 size={18} /> Share
                </button>
                <button
                  onClick={onEdit}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-surface px-4 text-[14px] font-medium text-ink ring-1 ring-edge transition-colors hover:bg-raised"
                >
                  <Settings2 size={18} /> Edit profile
                </button>
              </>
            ) : (
              !p.isOwner && (
                <FriendButton
                  handle={p.handle}
                  initial={p.friendStatus ?? "none"}
                  edgeId={p.friendEdgeId}
                />
              )
            )}
          </div>
        </div>
        {sharing && <ShareModal summary={p} onClose={() => setSharing(false)} />}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill value={compactNumber(watchedOverride ?? p.counts.watched)} label="Watched" />
          <StatPill value={compactNumber(mangaReadOverride ?? (p.counts as { mangaRead?: number }).mangaRead ?? 0)} label="Read" />
          <StatPill value={compactNumber(p.counts.friends)} label="Friends" />
          <StatPill value={compactNumber(p.counts.badges)} label="Badges" />
        </div>
      </div>
    </header>
  );
}

function HeroBadge({ badge }: { badge: HeroBadge }) {
  return (
    <span className="group/badge relative inline-flex">
      <img src={badge.iconUrl} width={22} height={22} alt={badge.name} draggable={false} className="inline-block" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-[10px] bg-elevated px-2 py-1 text-[11px] font-medium text-ink opacity-0 shadow-lg ring-1 ring-edge-soft transition-opacity duration-150 group-hover/badge:opacity-100">
        {badge.name}
      </span>
    </span>
  );
}

type FriendRel = NonNullable<ProfileSummary["friendStatus"]>;

const FRIEND_BTN =
  "inline-flex min-h-11 items-center gap-2 rounded-[10px] px-4 text-[14px] font-semibold transition-colors disabled:opacity-70";

function FriendButton({
  handle,
  initial,
  edgeId,
}: {
  handle: string;
  initial: FriendRel;
  edgeId?: string;
}) {
  const [rel, setRel] = useState<FriendRel>(initial);
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);
  const [error, setError] = useState(false);

  const act = async (fn: () => Promise<unknown>, next: FriendRel) => {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      await fn();
      setRel(next);
      setHover(false);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  if (rel === "blocked") return null;

  if (rel === "friends") {
    return (
      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => act(() => removeFriend(handle), "none")}
        disabled={busy}
        className={`${FRIEND_BTN} ${hover ? "bg-danger/12 text-danger ring-1 ring-danger/30" : "bg-surface text-ink ring-1 ring-edge"}`}
      >
        {busy ? (
          <Loader2 size={18} className="animate-spin" />
        ) : hover ? (
          <UserMinus size={18} />
        ) : (
          <Check size={18} strokeWidth={2.6} />
        )}
        {busy ? "Removing..." : hover ? "Remove friend" : "Friends"}
      </button>
    );
  }

  if (rel === "incoming") {
    return (
      <button
        onClick={() => (edgeId ? act(() => acceptFriend(edgeId), "friends") : undefined)}
        disabled={busy || !edgeId}
        className={`${FRIEND_BTN} bg-ink text-canvas hover:opacity-90`}
      >
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={2.6} />}
        {busy ? "Accepting..." : "Accept request"}
      </button>
    );
  }

  if (rel === "outgoing") {
    return (
      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => act(() => removeFriend(handle), "none")}
        disabled={busy}
        className={`${FRIEND_BTN} ${hover ? "bg-danger/12 text-danger ring-1 ring-danger/30" : "bg-surface text-ink-muted ring-1 ring-edge"}`}
      >
        {busy ? (
          <Loader2 size={18} className="animate-spin" />
        ) : hover ? (
          <UserMinus size={18} />
        ) : (
          <Check size={18} strokeWidth={2.6} />
        )}
        {busy ? "Canceling..." : hover ? "Cancel request" : "Requested"}
      </button>
    );
  }

  return (
    <button
      onClick={() => act(() => sendFriendRequest(handle), "outgoing")}
      disabled={busy}
      className={`${FRIEND_BTN} ${error ? "bg-surface text-ink ring-1 ring-edge" : "bg-ink text-canvas hover:opacity-90"}`}
    >
      {busy ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
      {busy ? "Sending..." : error ? "Try again" : "Add friend"}
    </button>
  );
}
