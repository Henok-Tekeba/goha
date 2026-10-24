"use client";

import PapersList from "../components/papers-list.component";

export default function ResearchView() {
  return (
    <div className="mx-auto max-w-4xl px-6">
      <header className="mb-8">
        <h1
          className="text-3xl text-primary tracking-[-0.03em] md:text-4xl"
          style={{ fontFamily: "Aspekta", fontWeight: 500 }}
        >
          Research
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          Published work on Ethiopian languages — speech recognition,
          translation, LLMs, benchmarks — swept from arXiv daily. Filter by
          language or task; open the full record for abstracts and authors.
        </p>
      </header>
      <PapersList />
    </div>
  );
}
