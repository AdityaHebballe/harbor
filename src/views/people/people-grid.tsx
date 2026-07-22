import { CloudOff, KeyRound, RotateCw, SlidersHorizontal } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { useView } from "@/lib/view";
import type { PeopleRankStatus } from "@/lib/people-rankings";
import type { HarborRankExplanation, PersonRankEntry, RankSource } from "@/lib/harbor-rank";
import type { Meta } from "@/lib/cinemeta";
import { PersonRankCard } from "./person-rank-card";

const GRID = "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 items-start auto-rows-min";
const GHOST_LEDGER = [30, 34, 24, 12];

export function PeopleGrid({
  status,
  people,
  source,
  expandedId,
  onToggleExpand,
  onOpenPerson,
  onOpenMeta,
  onClearFilters,
  onRetry,
}: {
  status: PeopleRankStatus;
  people: HarborRankExplanation[] | PersonRankEntry[];
  source: RankSource;
  expandedId: number | null;
  onToggleExpand: (id: number) => void;
  onOpenPerson: (id: number) => void;
  onOpenMeta: (meta: Meta) => void;
  onClearFilters: () => void;
  onRetry?: () => void;
}) {
  const t = useT();
  const { openSettings } = useView();

  if (status === "loading") {
    return (
      <ul className={GRID} aria-busy="true">
        {Array.from({ length: 9 }, (_, i) => (
          <li key={i}>
            <ShimmerCard delay={i * 60} />
          </li>
        ))}
      </ul>
    );
  }

  if (status === "no-key") {
    return (
      <StateShell
        icon={<KeyRound size={20} strokeWidth={2} className="text-ink-subtle" />}
        title={t("Add a TMDB key to load rankings")}
        body={t("Top on TMDB reads live popularity, which needs your own key.")}
        action={
          <ActionButton onClick={() => openSettings("account")}>{t("Open settings")}</ActionButton>
        }
      />
    );
  }

  if (status === "error") {
    return (
      <StateShell
        title={t("Couldn't load rankings")}
        body={t("Something went wrong reaching the ranking feed.")}
        action={
          onRetry ? (
            <ActionButton onClick={onRetry}>
              <RotateCw size={15} strokeWidth={2.2} />
              {t("Retry")}
            </ActionButton>
          ) : null
        }
      />
    );
  }

  if (people.length === 0) {
    return (
      <StateShell
        icon={<SlidersHorizontal size={20} strokeWidth={2} className="text-ink-subtle" />}
        title={t("No people match these filters")}
        body={t("Widen the department or country to see more.")}
        action={<ActionButton onClick={onClearFilters}>{t("Clear filters")}</ActionButton>}
      />
    );
  }

  const isHarbor = source === "harbor";
  const explained = isHarbor ? (people as HarborRankExplanation[]) : null;
  const ranked = explained ? explained.filter((p) => p.score !== null) : people;
  const unranked = explained ? explained.filter((p) => p.score === null) : [];

  const card = (person: HarborRankExplanation | PersonRankEntry) => (
    <li key={person.id}>
      <PersonRankCard
        person={person}
        source={source}
        expanded={expandedId === person.id}
        onToggle={() => onToggleExpand(person.id)}
        onOpenPerson={onOpenPerson}
        onOpenMeta={onOpenMeta}
      />
    </li>
  );

  return (
    <div className="flex flex-col gap-6">
      {status === "offline" && (
        <div className="flex items-center gap-2 self-start rounded-full bg-surface/60 px-3.5 py-2 text-[12.5px] text-ink-muted ring-1 ring-edge-soft">
          <CloudOff size={14} strokeWidth={2} className="text-ink-subtle" />
          {t("Showing last synced ranking")}
        </div>
      )}

      <ul className={GRID}>{ranked.map(card)}</ul>

      {unranked.length > 0 && (
        <>
          <div className="my-1 flex items-center gap-4">
            <span className="h-px flex-1 bg-edge-soft" aria-hidden />
            <span className="text-[11px] uppercase tracking-[0.16em] text-ink-subtle">
              {t("Not enough rated work yet")}
            </span>
            <span className="h-px flex-1 bg-edge-soft" aria-hidden />
          </div>
          <ul className={GRID}>{unranked.map(card)}</ul>
        </>
      )}
    </div>
  );
}

function delayVar(delay: number): CSSProperties {
  return { "--ai-delay": `${delay}ms` } as CSSProperties;
}

function ShimmerCard({ delay }: { delay: number }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-surface/40 p-4 ring-1 ring-edge-soft">
      <div
        className="harbor-shimmer relative h-[132px] w-[92px] shrink-0 rounded-xl"
        style={delayVar(delay)}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 pt-1">
        <div className="harbor-shimmer relative h-4 w-3/5 rounded-md" style={delayVar(delay)} />
        <div className="harbor-shimmer relative h-3 w-2/5 rounded-md" style={delayVar(delay)} />
        <div className="harbor-shimmer relative mt-1 h-3 w-4/5 rounded-md" style={delayVar(delay)} />
        <div className="mt-auto flex h-1.5 gap-px overflow-hidden rounded-full">
          {GHOST_LEDGER.map((w, i) => (
            <span key={i} className="h-full bg-ink/10" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StateShell({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  action: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl bg-surface/30 px-8 py-14 text-center ring-1 ring-edge-soft">
      {icon && (
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-elevated/50 ring-1 ring-edge-soft">
          {icon}
        </span>
      )}
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      <p className="text-[13px] leading-relaxed text-ink-muted">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

function ActionButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[13.5px] font-semibold text-canvas transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      {children}
    </button>
  );
}
