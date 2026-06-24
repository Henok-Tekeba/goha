"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Item, Tab, Stats } from "@/types";
import { fetchStats, fetchModels, fetchDatasets, fetchPapers, fetchCompanies } from "@/lib/github";
import Nav from "./Nav";
import Hero from "./Hero";
import QuickStart from "./QuickStart";
import BestFor from "./BestFor";
import ActivityFeed from "./ActivityFeed";
import ThisWeek from "./ThisWeek";
import TrendingSection from "./TrendingSection";
import TabsBar from "./TabsBar";
import FilterChips from "./FilterChips";
import CardGrid from "./CardGrid";
import Pagination from "./Pagination";
import ComparePill from "./ComparePill";
import ComparePanel from "./ComparePanel";
import Bottom from "./Bottom";

const LANG_CODE: Record<string, string> = {
  amharic: "AM", oromo: "OM", tigrinya: "TI", geez: "GZ",
};

const COMPARE_LIMIT = 3;

const PAGE_SIZE = 12;
const PAGINATED_TABS: Tab[] = ["models", "datasets", "research"];

function readPageFromUrl(tab: Tab): number {
  if (typeof window === "undefined") return 1;
  const sp = new URLSearchParams(window.location.search);
  const raw = sp.get(`page_${tab}`);
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function writePageToUrl(tab: Tab, page: number) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (page <= 1) {
    url.searchParams.delete(`page_${tab}`);
  } else {
    url.searchParams.set(`page_${tab}`, String(page));
  }
  window.history.replaceState({}, "", url.toString());
}

export default function ExplorePage({ initialStats }: { initialStats: Stats }) {
  const [activeTab, setActiveTab] = useState<Tab>("models");
  const [activeLang, setActiveLang] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Record<Tab, number>>({
    models: 1,
    datasets: 1,
    companies: 1,
    research: 1,
  });
  const [compareSelected, setCompareSelected] = useState<Item[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const tabSectionRef = useRef<HTMLDivElement | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({
    models: initialStats.models,
    datasets: initialStats.datasets,
    companies: initialStats.companies,
    research: initialStats.research,
  });
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    fetchStats()
      .then((d) => {
        const data = d?.data;
        if (data && data.models != null) {
          setStats({
            models: data.models ?? 0,
            datasets: data.datasets ?? 0,
            companies: data.companies ?? 0,
            research: data.research ?? 0,
            languages: data.languages ?? 6,
            indexed: data.indexed || "just now",
            featured: data.featured || { downloads: 0, name: "", lang: "" },
          });
          setCounts({
            models: data.models ?? 0,
            datasets: data.datasets ?? 0,
            companies: data.companies ?? 0,
            research: data.research ?? 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const fetchers: Record<string, () => Promise<{ data: any[] }>> = {
    models: fetchModels,
    datasets: fetchDatasets,
    research: fetchPapers,
    companies: fetchCompanies,
  };

  const fetchTab = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      const fn = fetchers[tab];
      if (!fn) { setItems([]); return; }
      const d = await fn();
      setItems((d as any)?.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTab(activeTab);
    setPage((prev) => ({ ...prev, [activeTab]: readPageFromUrl(activeTab) }));
  }, [activeTab, fetchTab]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as Tab);
    setActiveLang("all");
    setSearchQuery("");
  }, []);

  const filtered = useMemo(() => {
    let result = items;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (d) =>
          (d.name || "").toLowerCase().includes(q) ||
          (d.desc || "").toLowerCase().includes(q) ||
          (d.org || "").toLowerCase().includes(q) ||
          (d.tags || []).some((t) => (t || "").toLowerCase().includes(q))
      );
    }
    if (activeLang !== "all") {
      const code = LANG_CODE[activeLang] || activeLang.toUpperCase();
      result = result.filter((d) => (d.langs || []).includes(activeLang) || (d.langs || []).includes(code));
    }
    return result;
  }, [items, searchQuery, activeLang]);

  const paginated = useMemo(() => {
    if (!PAGINATED_TABS.includes(activeTab)) {
      return { pageItems: filtered, totalPages: 1, currentPage: 1 };
    }
    const currentPage = page[activeTab] || 1;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return {
      pageItems: filtered.slice(start, start + PAGE_SIZE),
      totalPages,
      currentPage: safePage,
    };
  }, [filtered, page, activeTab]);

  useEffect(() => {
    if (paginated.currentPage !== (page[activeTab] || 1)) {
      setPage((prev) => ({ ...prev, [activeTab]: paginated.currentPage }));
    }
  }, [paginated.currentPage, activeTab, page]);

  const handlePageChange = useCallback(
    (p: number) => {
      if (p === page[activeTab]) return;
      setPage((prev) => ({ ...prev, [activeTab]: p }));
      writePageToUrl(activeTab, p);
      if (tabSectionRef.current) {
        tabSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [activeTab, page]
  );

  const compareKey = useCallback((d: Item) => d.id || d.name, []);
  const compareKeys = useMemo(() => new Set(compareSelected.map(compareKey)), [compareSelected, compareKey]);

  const handleToggleCompare = useCallback((d: Item) => {
    const key = compareKey(d);
    setCompareSelected((prev) => {
      const exists = prev.some((x) => compareKey(x) === key);
      if (exists) return prev.filter((x) => compareKey(x) !== key);
      if (prev.length >= COMPARE_LIMIT) return prev;
      return [...prev, d];
    });
  }, [compareKey]);

  const handleRemoveCompare = useCallback((key: string) => {
    setCompareSelected((prev) => prev.filter((x) => compareKey(x) !== key));
  }, [compareKey]);

  const handleClearCompare = useCallback(() => {
    setCompareSelected([]);
    setCompareOpen(false);
  }, []);

  useEffect(() => {
    if (activeTab !== "models" && compareOpen) setCompareOpen(false);
  }, [activeTab, compareOpen]);

  return (
    <>
      <Nav />
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stats={stats}
      />
      <QuickStart />
      <BestFor />
      <ActivityFeed />
      <ThisWeek />
      <TrendingSection />
      <TabsBar activeTab={activeTab} counts={counts} onTabChange={handleTabChange} />
      <FilterChips activeLang={activeLang} onLangChange={setActiveLang} />
      <div ref={tabSectionRef}>
        <CardGrid
          items={paginated.pageItems}
          query={searchQuery}
          loading={loading}
          compareMode={activeTab === "models"}
          compareSelected={compareKeys}
          onToggleCompare={handleToggleCompare}
        />
        {PAGINATED_TABS.includes(activeTab) && (
          <Pagination
            page={paginated.currentPage}
            totalPages={paginated.totalPages}
            onChange={handlePageChange}
          />
        )}
      </div>
      <ComparePill
        count={compareSelected.length}
        onOpen={() => setCompareOpen(true)}
        onClear={handleClearCompare}
      />
      {compareOpen && compareSelected.length > 0 && (
        <ComparePanel
          items={compareSelected}
          onClose={() => setCompareOpen(false)}
          onRemove={handleRemoveCompare}
        />
      )}
      <Bottom stats={stats} />
    </>
  );
}
