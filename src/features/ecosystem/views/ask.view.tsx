"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HiArrowLongRight, HiMagnifyingGlass } from "react-icons/hi2";
import { asset } from "@/shared/lib/asset";
import {
  getAllProjects,
  getLanguageCoverage,
  getLeaderboard,
  getOrgs,
  getPapers,
} from "@/shared/lib/local-data.client";
import { cn } from "@/shared/lib/utils";

import { type AskItem, buildAskAnswer } from "../lib/ask-answer";
import { parseAskQuery } from "../lib/ask-parser";

const EXAMPLES = [
  "Tigrinya speech models",
  "What's missing for Afaan Oromo?",
  "Amharic LLMs under 2B",
  "papers about code-switching",
  "best Amharic speech model",
  "who builds Amharic embeddings?",
];

const TYPE_ICON: Record<AskItem["type"], string> = {
  model: "/types/ai.svg",
  dataset: "/types/dataset.svg",
  paper: "/types/research.svg",
  org: "/types/company.svg",
  benchmark: "/types/audio.svg",
};

function useAskData() {
  return useQuery({
    queryKey: ["ecosystem", "ask-data"],
    queryFn: () =>
      Promise.all([
        getAllProjects(),
        getPapers(),
        getOrgs(),
        getLeaderboard(),
        getLanguageCoverage(),
      ]).then(([projects, papers, orgs, leaderboard, coverage]) => ({
        projects,
        papers,
        orgs,
        leaderboard,
        coverage,
      })),
  });
}

function ResultRow({ item }: { item: AskItem }) {
  const className =
    "flex items-start gap-3 rounded-[12px] px-3 py-2.5 transition-colors hover:bg-secondary/60";
  const content = (
    <>
      <span className="mt-px flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-muted-black-stroke">
        <Image
          src={asset(TYPE_ICON[item.type])}
          alt=""
          width={18}
          height={18}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-[13px] text-primary tracking-[-0.01em]">
          {item.title}
        </span>
        <span className="mt-0.5 block truncate text-muted-foreground text-xs">
          {item.subtitle}
        </span>
      </span>
      {item.meta && (
        <span className="shrink-0 pt-0.5 text-[11px] text-muted-foreground tabular-nums">
          {item.meta}
        </span>
      )}
    </>
  );

  return item.external ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </a>
  ) : (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}

export default function AskView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [input, setInput] = useState(initial);
  const [submitted, setSubmitted] = useState(initial);

  useEffect(() => {
    setInput(searchParams.get("q") ?? "");
    setSubmitted(searchParams.get("q") ?? "");
  }, [searchParams]);

  const { data, isLoading } = useAskData();

  const parsed = useMemo(
    () => (submitted ? parseAskQuery(submitted) : null),
    [submitted]
  );

  const answer = useMemo(() => {
    if (!parsed || !data) return null;
    return buildAskAnswer(parsed, data);
  }, [parsed, data]);

  const submit = (value: string) => {
    const q = value.trim();
    setSubmitted(q);
    const params = new URLSearchParams(searchParams);
    if (q) params.set("q", q);
    else params.delete("q");
    const qs = params.toString();
    router.replace(`/ask${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <div className="mx-auto max-w-3xl px-6">
      <header className="mb-8">
        <h1
          className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Ask Goha
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          Ask about the ecosystem in plain language. Answers come straight from
          the index — every number links to the model, paper or organization it
          came from. No chatbot, no invented facts.
        </p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <HiMagnifyingGlass className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="e.g. Which Tigrinya speech models exist?"
            aria-label="Ask Goha"
            className="h-12 w-full rounded-full border border-muted-black-stroke bg-white pr-4 pl-11 text-primary text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ost-blue-two/40"
          />
        </div>
        <button
          type="submit"
          className="flex h-12 items-center gap-1.5 rounded-full bg-primary px-5 text-primary-foreground text-sm transition-opacity hover:opacity-90"
        >
          Ask
          <HiArrowLongRight className="size-4" />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setInput(example);
              submit(example);
            }}
            className={cn(
              "rounded-full border border-muted-black-stroke px-3 py-1.5 text-xs tracking-tight transition-colors",
              submitted === example
                ? "border-transparent bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            {example}
          </button>
        ))}
      </div>

      {isLoading && submitted && (
        <div className="mt-8 h-24 animate-pulse rounded-[18px] border border-muted-black-stroke" />
      )}

      {answer && (
        <section className="mt-8" aria-live="polite">
          <div className="rounded-[18px] border border-muted-black-stroke bg-white px-5 py-4">
            <h2
              className="text-lg text-primary tracking-[-0.02em]"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              {answer.headline}
            </h2>
            <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
              {answer.body}
            </p>
          </div>

          {answer.groups.length > 0 && (
            <div className="mt-5 flex flex-col gap-5">
              {answer.groups.map((group) => (
                <div key={group.label}>
                  <h3 className="mb-1.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    {group.label}
                  </h3>
                  <div className="rounded-[16px] border border-muted-black-stroke bg-white py-1.5">
                    {group.items.map((item, i) => (
                      <ResultRow key={`${item.href}-${i}`} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {answer.suggestions.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-1.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Try next
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {answer.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setInput(suggestion);
                      submit(suggestion);
                    }}
                    className="rounded-full border border-muted-black-stroke px-3 py-1.5 text-muted-foreground text-xs tracking-tight transition-colors hover:text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {!submitted && (
        <div className="mt-10 rounded-[18px] border border-muted-black-stroke bg-white px-5 py-4">
          <h2 className="font-medium text-primary text-sm tracking-tight">
            What you can ask
          </h2>
          <ul className="mt-2 grid grid-cols-1 gap-1.5 text-muted-foreground text-xs leading-relaxed sm:grid-cols-2">
            <li>· a language + a task — “Tigrinya speech models”</li>
            <li>· gaps — “What's missing for Oromo?”</li>
            <li>· research — “papers about code-switching”</li>
            <li>· people — “who builds Amharic embeddings?”</li>
            <li>· constraints — “Amharic LLMs under 2B”</li>
            <li>· rankings — “best Amharic speech model”</li>
          </ul>
        </div>
      )}
    </div>
  );
}
