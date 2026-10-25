"use client";

import { useState, type ReactNode } from "react";
import { Drawer } from "~/components/ui/drawer";
import { ArrowLeftIcon } from "~/components/ui/icons";
import type { DerivedRegion } from "../api/paths-api";
import { getGuidebookEntries, type GuidebookEntry } from "../lib/reference";

const BODY = "m-0 text-[15px] leading-[1.65] text-[#626262] dark:text-[#b2b2b6]";

function Label({ children, className = "text-ink-soft dark:text-[#8c8c91]" }: { children: ReactNode; className?: string }) {
  return <p className={`mb-2 text-[11px] font-bold tracking-[.09em] uppercase ${className}`}>{children}</p>;
}

function Code({ code }: { code: string }) {
  return (
    <pre className="m-0 overflow-x-auto border-l-2 border-[#3f3b68] bg-[#1e1e1e] px-5 py-4 text-sm leading-[1.75] text-night-ink">
      <code>{code}</code>
    </pre>
  );
}

function EntryPage({
  entry,
  entries,
  onOpenEntry,
  onBack,
}: {
  entry: GuidebookEntry;
  entries: GuidebookEntry[];
  onOpenEntry: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <article className="mx-auto grid w-full max-w-[760px] gap-6">
      <header className="grid gap-4">
        <button
          type="button"
          onClick={onBack}
          className="focus-ring inline-flex w-fit items-center gap-1 rounded-md text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] dark:text-[#88bdf2] dark:hover:text-[#a8cbf7]"
        >
          <ArrowLeftIcon className="size-4" />
          All concepts
        </button>
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#3d77eb] uppercase dark:text-[#88bdf2]">{entry.category}</span>
          <h3 className="mt-1.5 mb-0 text-[27px] leading-[1.15] font-semibold text-neutral-800 dark:text-night-ink">{entry.title}</h3>
        </div>
      </header>

      <section>
        <Label>Definition</Label>
        <p className="m-0 text-[17px] leading-[1.7] text-neutral-800 dark:text-night-ink">{entry.definition}</p>
      </section>
      <section>
        <Label>Mental model</Label>
        <p className={`${BODY} text-base leading-[1.7]`}>{entry.mentalModel}</p>
      </section>
      <section>
        <Label>Syntax</Label>
        <Code code={entry.syntax} />
      </section>
      <section>
        <Label>How it works</Label>
        <p className={`${BODY} text-base leading-[1.7]`}>{entry.howItWorks}</p>
      </section>
      <section>
        <Label>When to use it</Label>
        <ul className={`${BODY} grid gap-2 pl-5 marker:text-[#88bdf2]`}>
          {entry.whenToUse.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section>
        <p className="mb-3 text-[11px] font-bold tracking-[.09em] text-ink-soft uppercase dark:text-[#8c8c91]">Examples</p>
        <div className="grid gap-5">
          {entry.examples.map((example) => (
            <div key={example.title}>
              <strong className="text-[15px] text-neutral-800 dark:text-night-ink">{example.title}</strong>
              <div className="my-2">
                <Code code={example.code} />
              </div>
              <p className={BODY}>{example.explanation}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <Label className="text-[#8a6d10] dark:text-[#c9a227]">Common mistakes</Label>
        <ul className={`${BODY} grid gap-2 pl-5 marker:text-[#f0c964]`}>
          {entry.mistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>
      </section>
      <aside className="border-l-2 border-[#6699ec] bg-[#eff4ff] px-5 py-4 dark:bg-[#211f30]">
        <strong className="block text-xs tracking-[.08em] text-[#2563eb] uppercase dark:text-[#88bdf2]">Things to remember</strong>
        <ul className="mt-2 mb-0 grid gap-1.5 pl-5 text-[15px] leading-[1.65] text-neutral-800 marker:text-[#2563eb] dark:text-night-ink dark:marker:text-[#88bdf2]">
          {entry.remember.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </aside>
      <section>
        <Label>Related concepts</Label>
        <div className="flex flex-wrap gap-2">
          {entry.related.map((relatedId) => {
            const related = entries.find((item) => item.id === relatedId);
            return (
              related && (
                <button
                  key={relatedId}
                  type="button"
                  onClick={() => onOpenEntry(relatedId)}
                  className="focus-ring rounded-lg border border-[#cbdcf3] bg-[#f0f5fd] px-3 py-2 text-sm font-semibold text-[#2563eb] dark:border-[#3f3b68] dark:bg-[#211f30] dark:text-[#b8ccf7] dark:hover:bg-[#292642]"
                >
                  {related.title}
                </button>
              )
            );
          })}
        </div>
      </section>
    </article>
  );
}

function EntryList({ region, entries, onOpenEntry }: { region: DerivedRegion; entries: GuidebookEntry[]; onOpenEntry: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const visible = entries.filter((entry) => `${entry.title} ${entry.category} ${entry.definition}`.toLowerCase().includes(term));

  return (
    <div className="mx-auto grid w-full max-w-[1040px] gap-7">
      <header>
        <p className="m-0 text-[11px] font-bold tracking-widest text-[#3d77eb] uppercase dark:text-[#88bdf2]">Your reference book</p>
        <h3 className="mt-1 mb-1 text-[26px] font-semibold text-neutral-800 dark:text-night-ink">Find the idea you need</h3>
        <p className="m-0 max-w-[62ch] text-[15px] leading-[1.55] text-[#626262] dark:text-[#aaa9b0]">
          Choose a concept for a clear explanation, example, and common pitfalls.
        </p>
      </header>
      {entries.length === 0 ? (
        <p className="m-0 max-w-[30ch] pt-8 text-[15px] leading-[1.6] text-ink-soft dark:text-night-soft">
          Nothing to study here yet — this section&apos;s guidebook arrives with its lessons.
        </p>
      ) : (
        <>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${region.title} concepts`}
            aria-label={`Search ${region.title} concepts`}
            className="min-h-12 w-full rounded-xl border border-[#d8d8d4] bg-transparent px-4 text-[15px] text-neutral-800 outline-none placeholder:text-[#85838c] focus:border-[#88bdf2] dark:border-night-line dark:text-night-ink"
          />
          <nav aria-label={`${region.title} concepts`}>
            <span className="mb-3 block text-[11px] font-bold tracking-[.12em] text-[#8a8a88] uppercase dark:text-[#7d7d80]">
              {visible.length} of {entries.length} concepts
            </span>
            {visible.length === 0 ? (
              <p className="m-0 text-[15px] text-ink-soft dark:text-night-soft">No concepts match that search.</p>
            ) : (
              <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 min-[640px]:grid-cols-2 min-[1280px]:grid-cols-3">
                {visible.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => onOpenEntry(entry.id)}
                      className="focus-ring grid min-h-[150px] w-full content-between rounded-xl border border-[#e4e4e0] bg-white p-4 text-left transition-colors hover:border-[#cbdcf3] hover:bg-[#f6f9fe] dark:border-[#2c2c30] dark:bg-[#1c1c1f] dark:hover:border-[#55505f] dark:hover:bg-[#24212e]"
                    >
                      <span className="text-[11px] font-bold tracking-[.08em] text-[#777774] uppercase dark:text-[#85838c]">{entry.category}</span>
                      <span>
                        <span className="block text-lg leading-tight font-semibold text-neutral-800 dark:text-night-ink">{entry.title}</span>
                        <span className="mt-2 block text-sm leading-normal text-[#626262] dark:text-[#aaa9b0]">{entry.definition}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </>
      )}
    </div>
  );
}

// A searchable reference book for the region being studied, as a sheet that
// slides up over the route.
export function GuidebookView({ region, onClose }: { region: DerivedRegion; onClose: () => void }) {
  const entries = getGuidebookEntries(region.id);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = entries.find((entry) => entry.id === activeId);

  return (
    <Drawer title="Guidebook" onClose={onClose} placement="bottom" expandable compactHeader>
      {active ? (
        <EntryPage entry={active} entries={entries} onOpenEntry={setActiveId} onBack={() => setActiveId(null)} />
      ) : (
        <EntryList region={region} entries={entries} onOpenEntry={setActiveId} />
      )}
    </Drawer>
  );
}
