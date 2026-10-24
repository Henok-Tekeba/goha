import type { Metadata } from "next";
import Link from "next/link";
import CTAFooter from "@/shared/components/layout/cta-footer";
import { asset } from "@/shared/lib/asset";
import { getGapReport } from "@/shared/lib/local-data.server";
import { formatNumberShort } from "@/shared/lib/utils/format-number";
export const metadata: Metadata = {
  title: "The Gap Report — what Ethiopian AI is still missing · goha.et",
  description:
    "A data-cited report on the open problems in Ethiopian AI: empty language × task cells, unevaluated models, unlicensed assets and research without implementations.",
  alternates: { canonical: "/gaps" },
};

function Stat({
  value,
  label,
  detail,
}: {
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-[16px] border border-muted-black-stroke bg-white px-4 py-4">
      <p className="font-medium text-2xl text-primary tabular-nums">{value}</p>
      <p className="mt-0.5 text-[13px] text-primary">{label}</p>
      <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
        {detail}
      </p>
    </div>
  );
}

export default function GapsPage() {
  const report = getGapReport();
  const totalLanguages = report.languages.length;
  const emptyCount = report.emptyCells.length;
  const unevaluated = report.evaluation.total - report.evaluation.evaluated;
  const researchOnlyCount = report.researchOnly.length;

  /* group empty cells by language for the list */
  const emptyByLanguage = new Map<string, { slug: string; tasks: string[] }>();
  for (const cell of report.emptyCells) {
    if (!emptyByLanguage.has(cell.language))
      emptyByLanguage.set(cell.language, { slug: cell.slug, tasks: [] });
    emptyByLanguage.get(cell.language)?.tasks.push(cell.task);
  }

  return (
    <>
      <main>
        <div className="mx-auto max-w-4xl px-6">
          <header className="mb-10">
            <p className="mb-2 font-medium text-black/40 text-xs uppercase tracking-[0.08em]">
              Gap report
            </p>
            <h1
              className="max-w-2xl text-3xl text-primary leading-[1.1] tracking-[-0.03em] md:text-4xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              What Ethiopian AI is still missing
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground text-sm leading-relaxed">
              Every claim on this page is derived from the index — the same
              daily scrape that powers the rest of goha. Numbers are counts of
              what is publicly published, not estimates. If something is missing
              here, it is missing on Hugging Face, GitHub and arXiv too.
            </p>
            <p className="mt-2 text-black/40 text-xs tabular-nums">
              {totalLanguages} languages · {report.tasks.length} tasks ·{" "}
              {report.totalCells} cells analysed
            </p>
          </header>

          <section
            className="mb-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Summary"
          >
            <Stat
              value={`${emptyCount}`}
              label="empty cells"
              detail={`of ${report.totalCells} language × task combinations have no model, dataset or paper.`}
            />
            <Stat
              value={`${unevaluated}`}
              label="unevaluated models"
              detail={`of ${report.evaluation.total} models publish no evaluation result.`}
            />
            <Stat
              value={`${report.licensing.total}`}
              label="unlicensed assets"
              detail="models and datasets that declare no license — unclear for reuse."
            />
            <Stat
              value={`${researchOnlyCount}`}
              label="research-only cells"
              detail="tasks with published papers but no model or dataset to use."
            />
          </section>

          <section className="mb-14" aria-labelledby="matrix-heading">
            <h2
              id="matrix-heading"
              className="mb-1 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Coverage by language
            </h2>
            <p className="mb-4 text-muted-foreground text-xs">
              Models + datasets per task. A dash means nothing is indexed; a
              number in parentheses is published papers.
            </p>
            <div className="overflow-x-auto rounded-[16px] border border-muted-black-stroke bg-white">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-muted-black-stroke border-b text-left text-black/40 text-xs">
                    <th className="px-4 py-2.5 font-medium">Language</th>
                    {report.tasks.map((task) => (
                      <th
                        key={task}
                        className="px-3 py-2.5 text-right font-medium"
                      >
                        {task}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.languages.map((language) => (
                    <tr
                      key={language.slug}
                      className="border-muted-black-stroke border-b last:border-b-0"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/lang/${language.slug}`}
                          className="inline-flex items-center gap-2 text-primary text-sm hover:underline"
                        >
                          <span
                            aria-hidden
                            className="flex size-6 items-center justify-center rounded-[6px] border border-muted-black-stroke text-[11px]"
                            style={{
                              fontFamily: "'Noto Sans Ethiopic', sans-serif",
                            }}
                          >
                            {language.glyph}
                          </span>
                          {language.name}
                        </Link>
                      </td>
                      {language.cells.map((cell) => (
                        <td
                          key={cell.task}
                          className="px-3 py-2.5 text-right tabular-nums"
                        >
                          {cell.assets === 0 ? (
                            <span className="text-black/25">—</span>
                          ) : (
                            <span className="text-primary">{cell.assets}</span>
                          )}
                          {cell.papers > 0 && (
                            <span className="ml-1 text-[10px] text-black/30">
                              ({cell.papers})
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-14" aria-labelledby="missing-heading">
            <h2
              id="missing-heading"
              className="mb-1 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Nothing exists at all
            </h2>
            <p className="mb-4 text-muted-foreground text-xs">
              Language × task combinations with no model, dataset or paper — the
              blank spots on the map.
            </p>
            <ul className="flex flex-col gap-2">
              {[...emptyByLanguage.entries()].map(([language, data]) => (
                <li
                  key={language}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 rounded-[12px] border border-muted-black-stroke bg-white px-4 py-3"
                >
                  <Link
                    href={`/lang/${data.slug}`}
                    className="font-medium text-primary text-sm hover:underline"
                  >
                    {language}
                  </Link>
                  <span className="flex flex-wrap gap-1.5">
                    {data.tasks.map((task) => (
                      <span
                        key={task}
                        className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-black/60"
                      >
                        {task}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {report.researchOnly.length > 0 && (
            <section className="mb-14" aria-labelledby="research-heading">
              <h2
                id="research-heading"
                className="mb-1 text-lg text-primary tracking-[-0.03em] md:text-xl"
                style={{ fontFamily: "Aspekta", fontWeight: 500 }}
              >
                Research leads, assets lag
              </h2>
              <p className="mb-4 text-muted-foreground text-xs">
                Tasks with published papers but no model or dataset to actually
                use — knowledge exists, tooling does not.
              </p>
              <ul className="flex flex-col gap-2">
                {report.researchOnly.map((cell) => (
                  <li
                    key={`${cell.slug}-${cell.task}`}
                    className="flex items-baseline justify-between gap-3 rounded-[12px] border border-muted-black-stroke bg-white px-4 py-3"
                  >
                    <span className="text-primary text-sm">
                      {cell.language}{" "}
                      <span className="text-muted-foreground">·</span>{" "}
                      {cell.task}
                    </span>
                    <Link
                      href={`/lang/${cell.slug}`}
                      className="text-muted-foreground text-xs hover:text-primary"
                    >
                      coverage →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mb-14" aria-labelledby="unmeasured-heading">
            <h2
              id="unmeasured-heading"
              className="mb-1 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Popular but unmeasured
            </h2>
            <p className="mb-4 text-muted-foreground text-xs">
              The most-downloaded models that publish no evaluation result.
              Usage without evidence is the ecosystem's quietest risk.
            </p>
            <ul className="rounded-[16px] border border-muted-black-stroke bg-white">
              {report.unmeasured.map((model) => (
                <li
                  key={model.name}
                  className="border-muted-black-stroke border-b last:border-b-0"
                >
                  <Link
                    href={`/projects/${model.projectId}`}
                    className="flex items-baseline justify-between gap-4 px-4 py-2.5 transition-colors hover:bg-secondary/60"
                  >
                    <span className="min-w-0 truncate text-[13px] text-primary">
                      {model.name}
                      <span className="ml-2 text-muted-foreground text-xs">
                        {model.org}
                      </span>
                    </span>
                    <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
                      {formatNumberShort(model.downloads)}/mo
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-14" aria-labelledby="license-heading">
            <h2
              id="license-heading"
              className="mb-1 text-lg text-primary tracking-[-0.03em] md:text-xl"
              style={{ fontFamily: "Aspekta", fontWeight: 500 }}
            >
              Unclear licensing
            </h2>
            <p className="mb-4 text-muted-foreground text-xs">
              {report.licensing.total} assets declare no license. For companies
              building on public models, that is a legal grey zone — reuse is
              technically possible, commercially risky.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {report.licensing.examples.map((asset) => (
                <Link
                  key={`${asset.projectId}-${asset.name}`}
                  href={`/projects/${asset.projectId}`}
                  className="rounded-full border border-muted-black-stroke bg-white px-3 py-1.5 text-muted-foreground text-xs transition-colors hover:text-primary"
                >
                  {asset.name}
                  <span className="ml-1.5 text-black/30">{asset.kind}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mb-16 rounded-[18px] border border-muted-black-stroke bg-white px-5 py-4">
            <h2 className="font-medium text-primary text-sm tracking-tight">
              Methodology
            </h2>
            <p className="mt-2 max-w-3xl text-muted-foreground text-xs leading-relaxed">
              Languages and tasks are the ones the index tracks (ASR, TTS,
              translation, LLM, NER, embeddings). A cell counts a model or
              dataset when the asset declares the language and task in its
              metadata. Papers are matched by their derived language/task tags.
              "No evaluation" means the model card publishes no metrics table.
              "No license" means the card declares none. Everything is
              recomputed on every daily scrape — numbers here move as the
              ecosystem moves.
            </p>
            <p className="mt-2 text-muted-foreground text-xs">
              Related:{" "}
              <Link href="/lang" className="underline underline-offset-4">
                language coverage
              </Link>{" "}
              ·{" "}
              <Link
                href="/leaderboard"
                className="underline underline-offset-4"
              >
                published benchmarks
              </Link>{" "}
              ·{" "}
              <Link href="/ask" className="underline underline-offset-4">
                ask about a specific gap
              </Link>
            </p>
          </section>
        </div>
      </main>
      <CTAFooter
        imageIllustration={asset("/illustrations/winged-angel.png")}
        imageIllustrationMobile={asset(
          "/illustrations/winged-angel-mobile.png"
        )}
      />
    </>
  );
}
