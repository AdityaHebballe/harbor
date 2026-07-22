import { useEffect, useState } from "react";
import { useRankings, type PersonEntry } from "./rankings";
import { useSettings } from "./settings";
import {
  fetchRankList,
  peekRankSnapshot,
  type HarborRankExplanation,
  type PeopleDept,
  type PersonRankEntry,
  type RankSource,
} from "./harbor-rank";

export type PeopleRankStatus =
  | "loading"
  | "ready"
  | "empty"
  | "error"
  | "offline"
  | "no-key";

export type PeopleRankState = {
  status: PeopleRankStatus;
  source: RankSource;
  people: HarborRankExplanation[] | PersonRankEntry[];
  fromCache: boolean;
};

export function isHarborExplanation(
  person: HarborRankExplanation | PersonRankEntry,
): person is HarborRankExplanation {
  return "components" in person;
}

function toRankEntries(list: PersonEntry[], dept: PeopleDept): PersonRankEntry[] {
  return list.map((p) => ({
    id: p.id,
    rank: p.rank,
    name: p.name,
    profilePath: p.profilePath,
    department: dept,
    knownFor: p.knownFor,
  }));
}

export function usePeopleRankings({
  source,
  dept,
  country,
}: {
  source: RankSource;
  dept: PeopleDept;
  country: string | null;
}): PeopleRankState {
  const { settings } = useSettings();
  const rankings = useRankings();
  const [state, setState] = useState<PeopleRankState>({
    status: "loading",
    source,
    people: [],
    fromCache: false,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", source, people: [], fromCache: false });

    fetchRankList(source, dept, country).then((result) => {
      if (cancelled) return;
      if (result) {
        setState({
          status: result.list.length === 0 ? "empty" : "ready",
          source,
          people: result.list,
          fromCache: false,
        });
        return;
      }

      const snap = peekRankSnapshot(source, dept, country);
      if (snap) {
        setState({ status: "offline", source, people: snap.list, fromCache: true });
        return;
      }

      if (!settings.tmdbKey) {
        setState({ status: "no-key", source, people: [], fromCache: false });
        return;
      }

      if (!rankings.ready) {
        setState({ status: "loading", source, people: [], fromCache: false });
        return;
      }

      const fallback = toRankEntries(rankings.topList(dept), dept);
      setState({
        status: fallback.length === 0 ? "error" : "ready",
        source,
        people: fallback,
        fromCache: false,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [source, dept, country, settings.tmdbKey, rankings.ready, rankings.topList]);

  return state;
}
