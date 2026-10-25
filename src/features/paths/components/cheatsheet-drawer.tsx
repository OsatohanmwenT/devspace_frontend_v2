"use client";

import { useState } from "react";
import { Drawer } from "~/components/ui/drawer";
import { assetUrl } from "~/config/assets";
import type { CheatsheetPersonalization } from "../lib/cheatsheet-personalization";
import type { CheatsheetTopic } from "../lib/reference";
import { TopicGlyph } from "./reference-icons";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard can be blocked; the code is still selectable by hand.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="absolute top-2.5 right-2.5 rounded-lg border border-[#333338] bg-[#232326] px-2.5 py-1 text-[11px] font-semibold text-[#b2b2b6] transition-colors hover:border-[#4a4a50] hover:text-white focus-visible:outline-2 focus-visible:outline-blue-300"
      aria-label={copied ? "Copied" : "Copy"}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Snippet({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className="m-0 overflow-x-auto rounded-xl border border-[#2c2c30] bg-[#1c1c1f] px-4 py-3.5 pr-16 text-sm leading-[1.7] text-night-ink">
        <code>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheatsheetEntry({ topic, personalization }: { topic: CheatsheetTopic; personalization: CheatsheetPersonalization }) {
  return (
    <article className="grid gap-3 border-b border-[#ececea] pb-7 last:border-b-0 last:pb-0 dark:border-[#2c2c30]">
      <h3 className="m-0 flex items-center gap-2.5 text-[19px] font-semibold text-neutral-800 dark:text-night-ink">
        <span className="grid size-9 flex-none place-items-center rounded-xl bg-[#f0f5fd] text-[#2563eb] dark:bg-[#1c2a4d] dark:text-[#88bdf2]">
          <TopicGlyph topicId={topic.id} className="size-[18px]" />
        </span>
        {topic.title}
      </h3>

      {personalization.wantsMentalModel && topic.guidebook?.mentalModel && (
        <p className="m-0 text-sm leading-[1.6] text-[#2563eb] italic dark:text-[#88bdf2]">{topic.guidebook.mentalModel}</p>
      )}

      <Snippet code={topic.cheatsheet.syntax} />
      <p className="m-0 text-sm leading-[1.6] text-[#5c5c5c] dark:text-[#a8a8ac]">{topic.cheatsheet.rule}</p>

      <details className="group/details" open={personalization.wantsExamplesUpFront}>
        <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg text-[13px] font-semibold text-[#2563eb] marker:hidden hover:text-[#1d4ed8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 dark:text-[#88bdf2] dark:hover:text-[#a8cbf7]">
          <ChevronDownIcon className="size-4 flex-none transition-transform group-open/details:rotate-180" />
          Example and common mistake
        </summary>
        <div className="grid gap-3 pt-3">
          <Snippet code={topic.cheatsheet.example} />
          <p className="m-0 flex gap-2.5 rounded-xl bg-[#fff8e9] px-3.5 py-2.5 text-sm leading-[1.6] text-[#5e4b24] dark:bg-[#2a2117] dark:text-[#d6c9aa]">
            <span aria-hidden="true">⚠️</span>
            {topic.cheatsheet.mistake}
          </p>
        </div>
      </details>
    </article>
  );
}

type CheatsheetDrawerProps = {
  subtitle: string;
  topics: CheatsheetTopic[];
  personalization: CheatsheetPersonalization;
  onClose: () => void;
};

// Quick reference for the region being studied: syntax, the rule, an example
// and the usual mistake, opened to suit what the learner told us at onboarding.
export function CheatsheetDrawer({ subtitle, topics, personalization, onClose }: CheatsheetDrawerProps) {
  return (
    <Drawer title="Cheatsheet" subtitle={subtitle} onClose={onClose}>
      {topics.length === 0 ? (
        <div className="grid justify-items-center gap-3 pt-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- local Devy illustration */}
          <img className="size-20 object-contain opacity-70" src={assetUrl("devy/neutral.svg")} alt="" />
          <p className="m-0 max-w-[30ch] text-[15px] leading-[1.6] text-ink-soft dark:text-night-soft">
            Nothing to look up here yet — this section&apos;s quick reference arrives with its lessons.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {personalization.reason && (
            <p className="m-0 inline-flex items-center gap-2 self-start rounded-full bg-[#eff4ff] px-3 py-1.5 text-xs font-medium text-[#2563eb] dark:bg-[#1c2a4d] dark:text-[#88bdf2]">
              <span aria-hidden="true">✦</span>
              {personalization.reason}
            </p>
          )}
          <div className="grid gap-7">
            {topics.map((topic) => (
              <CheatsheetEntry key={topic.id} topic={topic} personalization={personalization} />
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}
