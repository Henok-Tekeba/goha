import { useQuery } from "@tanstack/react-query";
import {
  getActivityEvents,
  getEcosystemStats,
  getInsights,
  getLeaderboard,
  getOrgBySlug,
  getOrgs,
  getPapers,
} from "@/shared/lib/local-data.client";

import type { ActivityEventType } from "../types/ecosystem.types";

export const ecosystemKeys = {
  all: ["ecosystem"] as const,
  stats: () => [...ecosystemKeys.all, "stats"] as const,
  activity: (type?: ActivityEventType) =>
    [...ecosystemKeys.all, "activity", type ?? "all"] as const,
  insights: () => [...ecosystemKeys.all, "insights"] as const,
  orgs: () => [...ecosystemKeys.all, "orgs"] as const,
  org: (slug: string) => [...ecosystemKeys.orgs(), slug] as const,
  papers: () => [...ecosystemKeys.all, "papers"] as const,
  leaderboard: () => [...ecosystemKeys.all, "leaderboard"] as const,
};

export function useEcosystemStatsQuery() {
  return useQuery({
    queryKey: ecosystemKeys.stats(),
    queryFn: ({ signal }) => withSignal(getEcosystemStats(), signal),
  });
}

export function useActivityQuery(type?: ActivityEventType) {
  return useQuery({
    queryKey: ecosystemKeys.activity(type),
    queryFn: ({ signal }) =>
      withSignal(getActivityEvents(), signal).then((events) =>
        type ? events.filter((event) => event.type === type) : events
      ),
  });
}

export function useInsightsQuery() {
  return useQuery({
    queryKey: ecosystemKeys.insights(),
    queryFn: ({ signal }) => withSignal(getInsights(), signal),
  });
}

export function useOrgsQuery() {
  return useQuery({
    queryKey: ecosystemKeys.orgs(),
    queryFn: ({ signal }) => withSignal(getOrgs(), signal),
  });
}

export function useOrgQuery(slug: string) {
  return useQuery({
    queryKey: ecosystemKeys.org(slug),
    queryFn: ({ signal }) => withSignal(getOrgBySlug(slug), signal),
    enabled: !!slug,
  });
}

export function usePapersQuery() {
  return useQuery({
    queryKey: ecosystemKeys.papers(),
    queryFn: ({ signal }) => withSignal(getPapers(), signal),
  });
}

export function useLeaderboardQuery() {
  return useQuery({
    queryKey: ecosystemKeys.leaderboard(),
    queryFn: ({ signal }) => withSignal(getLeaderboard(), signal),
  });
}

/* react-query forwards an AbortSignal only when the fetcher opts in —
   the static loaders memoize one promise, so wiring the signal through
   would abort every later consumer of the cache. A stable promise is
   correct here; fetches are same-origin JSON on GitHub Pages. */
function withSignal<T>(promise: Promise<T>, _signal?: AbortSignal): Promise<T> {
  return promise;
}
