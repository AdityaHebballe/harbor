import { useEffect, useMemo, useRef, useState } from "react";
import { BackToTop } from "@/components/back-to-top";
import { useT } from "@/lib/i18n";
import { useScrollMemory, useView } from "@/lib/view";
import { fetchRankManifest, type PeopleDept, type RankSource } from "@/lib/harbor-rank";
import { usePeopleRankings } from "@/lib/people-rankings";
import { PeopleSourceSwitch } from "./people/people-source-switch";
import { PeopleFilterBar } from "./people/people-filter-bar";
import { PeopleGrid } from "./people/people-grid";
import { HowHarborRankWorks } from "./people/how-harbor-rank-works";

type Country = { iso: string; name: string };

type PeopleInit = {
  source?: RankSource;
  dept?: PeopleDept;
  focusSource?: boolean;
  nonce: number;
} | null;

function bandImage(person: { profilePath: string | null } | undefined): string | undefined {
  if (!person) return undefined;
  const withTitles = person as { topTitles?: Array<{ posterPath: string | null }> };
  const withKnown = person as { knownFor?: Array<{ posterPath: string | null }> };
  const path =
    withTitles.topTitles?.find((t) => t.posterPath)?.posterPath ??
    withKnown.knownFor?.find((k) => k.posterPath)?.posterPath ??
    person.profilePath;
  return path ? `https://image.tmdb.org/t/p/w780${path}` : undefined;
}

export function PeopleView({ init }: { init: PeopleInit }) {
  const t = useT();
  const { openPerson, openMeta } = useView();
  const scrollRef = useRef<HTMLElement>(null);

  const [source, setSource] = useState<RankSource>(init?.source ?? "harbor");
  const [dept, setDept] = useState<PeopleDept>(init?.dept ?? "Acting");
  const [country, setCountry] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [explainOpen, setExplainOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);

  useScrollMemory("people", scrollRef);

  useEffect(() => {
    let cancelled = false;
    fetchRankManifest().then((m) => {
      if (cancelled || !m?.countries) return;
      setCountries(m.countries);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!init) return;
    if (init.source) setSource(init.source);
    if (init.dept) setDept(init.dept);
    if (init.focusSource) scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [init?.nonce]);

  useEffect(() => {
    setExpandedId(null);
  }, [source, dept, country]);

  const { status, people } = usePeopleRankings({ source, dept, country });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;
    return people.filter((p) => p.name.toLowerCase().includes(q));
  }, [people, query]);

  const band = bandImage(people[0]);

  return (
    <main ref={scrollRef} className="absolute inset-0 z-40 overflow-y-auto bg-canvas">
      <div className="relative isolate">
        {band && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46vh] overflow-hidden"
          >
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${band})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(80px) saturate(1.3)",
                opacity: 0.4,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-canvas/40 via-canvas/70 to-canvas" />
          </div>
        )}

        <header className="flex flex-col justify-end px-12 pb-6 pt-28">
          <h1 className="font-display text-[76px] font-medium leading-[0.95] tracking-tight text-ink">
            {t("Top People")}
          </h1>
        </header>

        <PeopleSourceSwitch
          source={source}
          onSource={setSource}
          onExplain={() => setExplainOpen(true)}
        />

        <PeopleFilterBar
          dept={dept}
          onDept={setDept}
          country={country}
          onCountry={setCountry}
          query={query}
          onQuery={setQuery}
          countries={countries}
          onExplain={() => setExplainOpen(true)}
        />

        <div className="px-12 pb-20 pt-6">
          <PeopleGrid
            status={status}
            people={filtered}
            source={source}
            expandedId={expandedId}
            onToggleExpand={(id) => setExpandedId((cur) => (cur === id ? null : id))}
            onOpenPerson={(id) => openPerson(id)}
            onOpenMeta={openMeta}
            onClearFilters={() => {
              setQuery("");
              setCountry(null);
            }}
          />
        </div>
      </div>

      <HowHarborRankWorks open={explainOpen} onClose={() => setExplainOpen(false)} />
      <BackToTop scrollRef={scrollRef} />
    </main>
  );
}
