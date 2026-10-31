"use client";

import { useEffect, useState } from "react";
import { RichText } from "~/components/ui/rich-text";
import { usePrefersReducedMotion } from "~/hooks/use-prefers-reduced-motion";
import type { RichText as RichTextContent, RichTextPart } from "~/types/lesson";

const WORD_MS = 28;

// Words of plain text, with code chips and emphasis kept whole, so a reply can
// be revealed a word at a time without ever splitting a chip.
const toTokens = (content: RichTextContent): RichTextPart[] => {
  const parts: RichTextPart[] = Array.isArray(content) ? content : [content];
  return parts.flatMap((part): RichTextPart[] => (typeof part === "string" ? part.split(/(?<=\s)/) : [part]));
};

// Types a reply out word by word, then calls onDone. Reduced motion shows it all at once.
export function StreamedRichText({ content, onDone }: { content: RichTextContent; onDone: () => void }) {
  const reducedMotion = usePrefersReducedMotion();
  const tokens = toTokens(content);
  const [shown, setShown] = useState(0);
  const visible = reducedMotion ? tokens.length : shown;

  useEffect(() => {
    if (visible >= tokens.length) {
      onDone();
      return;
    }
    const timer = window.setTimeout(() => setShown((count) => count + 1), WORD_MS);
    return () => window.clearTimeout(timer);
  }, [visible, tokens.length, onDone]);

  return <RichText content={tokens.slice(0, visible)} />;
}
