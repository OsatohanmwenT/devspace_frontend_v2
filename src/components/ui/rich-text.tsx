import type { RichText as RichTextContent } from "~/types/lesson";

// Prose authored as an array of parts, so copy can carry inline code chips and
// emphasis. A plain string is still valid and renders as-is.
export function RichText({ content, className = "" }: { content: RichTextContent; className?: string }) {
  const parts = Array.isArray(content) ? content : [content];

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (typeof part === "string") return part;
        if ("code" in part) {
          return (
            <code
              key={index}
              className="mx-0.5 rounded-md border border-[#e1e1e1] bg-[#f2f2f0] px-1.5 py-0.5 text-[.9em] text-[#07389b] dark:border-night-line dark:bg-[#262626] dark:text-[#c4d8f2]"
            >
              {part.code}
            </code>
          );
        }
        return (
          <strong key={index} className="font-semibold text-neutral-800 dark:text-night-ink">
            {part.strong}
          </strong>
        );
      })}
    </span>
  );
}
