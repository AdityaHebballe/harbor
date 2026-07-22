import { ChevronDown } from "lucide-react";
import { Poster, usePosterChain } from "@/components/poster";
import { useT } from "@/lib/i18n";
import { useSettings } from "@/lib/settings";
import { isHarborExplanation } from "@/lib/people-rankings";
import type {
  HarborRankExplanation,
  PersonRankEntry,
  RankSource,
} from "@/lib/harbor-rank";
import type { KnownForEntry } from "@/lib/rankings";
import type { Meta } from "@/lib/cinemeta";
import { RankLedger } from "./rank-ledger";

function knownToMeta(k: KnownForEntry): Meta {
  return {
    id: `tmdb:${k.mediaType}:${k.id}`,
    type: k.mediaType === "tv" ? "series" : "movie",
    name: k.title,
    poster: k.posterPath ? `https://image.tmdb.org/t/p/w500${k.posterPath}` : undefined,
    releaseInfo: k.releaseInfo ?? undefined,
  };
}

const DEPT_LABEL: Record<string, string> = {
  Acting: "Actor",
  Directing: "Director",
  Production: "Producer",
  Writing: "Writer",
};

const SOURCE_TICK: Record<RankSource, string> = {
  harbor: "Harbor",
  tmdb: "TMDB",
  imdb: "IMDb",
  consensus: "Consensus",
};

type Person = HarborRankExplanation | PersonRankEntry;

export function PersonRankCard({
  person,
  source,
  expanded,
  onToggle,
  onOpenPerson,
  onOpenMeta,
}: {
  person: Person;
  source: RankSource;
  expanded: boolean;
  onToggle: () => void;
  onOpenPerson: (id: number) => void;
  onOpenMeta: (meta: Meta) => void;
}) {
  const t = useT();
  const harbor = isHarborExplanation(person);
  const photo = person.profilePath
    ? `https://image.tmdb.org/t/p/w185${person.profilePath}`
    : undefined;
  const dept = t(DEPT_LABEL[person.department] ?? person.department);
  const ranked = harbor && person.score !== null;

  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl bg-canvas/40 p-4 ring-1 ring-edge-soft transition-colors hover:bg-canvas/65 motion-reduce:transition-none">
      <div className="flex gap-4">
        <button
          onClick={() => onOpenPerson(person.id)}
          className="relative h-[132px] w-[96px] shrink-0 overflow-hidden rounded-xl bg-elevated/60 ring-1 ring-edge-soft/60"
          aria-label={t("Open {name}", { name: person.name })}
        >
          {photo ? (
            <img
              src={photo}
              alt={person.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Poster src={undefined} seed={String(person.id)} ratio="portrait" className="absolute inset-0" />
          )}
          <span className="absolute start-1.5 top-1.5 flex items-baseline gap-0.5 rounded-md bg-canvas/95 px-1.5 py-0.5">
            <span className="text-[8.5px] uppercase tracking-[0.18em] text-ink-subtle">#</span>
            <span className="text-[13px] font-bold tabular-nums text-accent">{person.rank}</span>
          </span>
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 overflow-hidden">
          <button
            onClick={() => onOpenPerson(person.id)}
            className="truncate text-start font-display text-[17px] font-medium leading-tight text-ink underline-offset-2 hover:underline"
          >
            {person.name}
          </button>
          <p className="text-[10.5px] uppercase tracking-[0.18em] text-ink-subtle">{dept}</p>

          {harbor && ranked && <RationaleLine person={person} />}
          {harbor && !ranked && (
            <p className="mt-1 text-[12.5px] text-ink-subtle">{t("Not enough rated work yet")}</p>
          )}
          {!harbor && source === "tmdb" && person.knownFor && person.knownFor.length > 0 && (
            <KnownRow entries={person.knownFor.slice(0, 3)} onOpenMeta={onOpenMeta} />
          )}
          {!harbor && source === "consensus" && person.blendSources && person.blendSources.length > 0 && (
            <BlendTicks sources={person.blendSources} />
          )}
        </div>
      </div>

      {harbor && ranked && (
        <>
          <div className="mt-auto">
            <RankLedger person={person} mode="micro" onOpenMeta={onOpenMeta} />
          </div>
          {expanded && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none">
              <RankLedger person={person} mode="full" onOpenMeta={onOpenMeta} />
            </div>
          )}
          <button
            onClick={onToggle}
            aria-expanded={expanded}
            className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl text-[12.5px] font-medium text-ink-muted ring-1 ring-edge-soft transition-colors hover:bg-elevated/50 hover:text-ink motion-reduce:transition-none"
          >
            {expanded ? t("Hide breakdown") : t("Why this rank")}
            <ChevronDown
              size={15}
              strokeWidth={2.4}
              className={`transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </>
      )}
    </div>
  );
}

function RationaleLine({ person }: { person: HarborRankExplanation }) {
  const t = useT();
  const dot = <span className="text-ink-subtle">&middot;</span>;
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12.5px] text-ink-muted">
      <span>
        <span className="tabular-nums">{person.acclaimedCount8}</span> {t("acclaimed titles")}
      </span>
      {dot}
      {person.awardsDataMissing ? (
        <span className="text-ink-subtle">{t("Awards data unavailable")}</span>
      ) : (
        <span>
          <span className="tabular-nums">{person.majorAwardWins}</span> {t("major awards")}
        </span>
      )}
      {dot}
      <span>
        <span className="tabular-nums">{person.leadRoles}</span> {t("lead roles")}
      </span>
    </p>
  );
}

function KnownRow({
  entries,
  onOpenMeta,
}: {
  entries: KnownForEntry[];
  onOpenMeta: (meta: Meta) => void;
}) {
  const t = useT();
  return (
    <div className="mt-1 flex flex-col gap-1.5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-ink-subtle">{t("Best known for")}</p>
      <div className="flex flex-wrap gap-1.5">
        {entries.map((k) => (
          <KnownChip
            key={`${k.mediaType}:${k.id}`}
            entry={k}
            onClick={() => onOpenMeta(knownToMeta(k))}
          />
        ))}
      </div>
    </div>
  );
}

function KnownChip({ entry, onClick }: { entry: KnownForEntry; onClick: () => void }) {
  const { settings } = useSettings();
  const rawPoster = entry.posterPath
    ? `https://image.tmdb.org/t/p/w92${entry.posterPath}`
    : undefined;
  const poster = usePosterChain(
    settings.rpdbKey,
    `tmdb:${entry.mediaType}:${entry.id}`,
    rawPoster,
    entry.mediaType === "tv" ? "series" : "movie",
  );
  return (
    <button
      onClick={onClick}
      title={entry.title}
      className="group/chip inline-flex max-w-[170px] items-center gap-1.5 rounded-full bg-elevated/40 py-0.5 pe-2.5 ps-0.5 ring-1 ring-edge-soft transition-colors hover:bg-elevated motion-reduce:transition-none"
    >
      <span className="h-7 w-5 shrink-0 overflow-hidden rounded-full bg-canvas">
        {poster.src ? (
          <img
            src={poster.src}
            alt=""
            loading="lazy"
            onError={poster.onError}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="block h-full w-full bg-gradient-to-br from-canvas to-elevated" />
        )}
      </span>
      <span className="truncate text-[11.5px] font-medium text-ink">{entry.title}</span>
      {entry.releaseInfo && (
        <span className="text-[10px] tabular-nums text-ink-subtle">{entry.releaseInfo}</span>
      )}
    </button>
  );
}

function BlendTicks({ sources }: { sources: RankSource[] }) {
  const t = useT();
  return (
    <div className="mt-1 flex flex-col gap-1">
      <p className="text-[10px] uppercase tracking-[0.18em] text-ink-subtle">{t("Blended from")}</p>
      <div className="flex flex-wrap gap-1">
        {sources.map((s) => (
          <span
            key={s}
            className="rounded-md px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-ink-muted ring-1 ring-edge-soft"
          >
            {t(SOURCE_TICK[s])}
          </span>
        ))}
      </div>
    </div>
  );
}
