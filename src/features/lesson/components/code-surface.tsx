"use client";

import { useLayoutEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { TOKEN_CLASSES, tokenizePython } from "../lib/python-highlight";

const INDENT = "    ";
const TEXT = "font-mono text-sm leading-[21px] whitespace-pre [tab-size:4]";
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
export const RUN_SHORTCUT = isMac ? "⌘ Enter" : "Ctrl Enter";

type CodeSurfaceProps = {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  disabled: boolean;
  errorLine: number | undefined;
  minHeight?: number;
};

// The code surface: a transparent textarea over a syntax-highlighted copy, a
// gutter that scrolls with it, and the keys an editor should handle.
export function CodeSurface({ code, onChange, onRun, disabled, errorLine, minHeight = 260 }: CodeSurfaceProps) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const gutter = useRef<HTMLOListElement>(null);
  const pendingSelection = useRef<[number, number] | null>(null);
  const tabEscapes = useRef(false);
  const lines = useMemo(() => code.split("\n"), [code]);

  // Restores the caret after a keystroke the editor rewrote itself.
  useLayoutEffect(() => {
    if (!pendingSelection.current || !textarea.current) return;
    textarea.current.setSelectionRange(...pendingSelection.current);
    pendingSelection.current = null;
  });

  const syncScroll = () => {
    const area = textarea.current;
    if (!area) return;
    if (layer.current) layer.current.style.transform = `translate(${-area.scrollLeft}px, ${-area.scrollTop}px)`;
    if (gutter.current) gutter.current.style.transform = `translateY(${-area.scrollTop}px)`;
  };

  const replace = (start: number, end: number, text: string, selectionStart: number, selectionEnd = selectionStart) => {
    onChange(code.slice(0, start) + text + code.slice(end));
    pendingSelection.current = [selectionStart, selectionEnd];
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const { selectionStart: start, selectionEnd: end } = event.currentTarget;
    const lineStart = code.lastIndexOf("\n", start - 1) + 1;

    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      onRun();
      return;
    }
    // Escape, then Tab, leaves the editor: Tab alone indents.
    if (event.key === "Escape") {
      tabEscapes.current = true;
      return;
    }
    if (event.key === "Tab") {
      if (tabEscapes.current) {
        tabEscapes.current = false;
        return;
      }
      event.preventDefault();
      if (event.shiftKey || start !== end) {
        // Indent or dedent every line the selection touches.
        const blockEnd = end > start && code[end - 1] === "\n" ? end - 1 : end;
        const block = code.slice(lineStart, blockEnd);
        const changed = block
          .split("\n")
          .map((line) => (event.shiftKey ? line.replace(/^ {1,4}/, "") : INDENT + line))
          .join("\n");
        const firstLineDelta = event.shiftKey ? -(block.match(/^ {1,4}/)?.[0].length ?? 0) : INDENT.length;
        replace(lineStart, blockEnd, changed, Math.max(lineStart, start + firstLineDelta), end + (changed.length - block.length));
      } else {
        replace(start, end, INDENT, start + INDENT.length);
      }
      return;
    }
    tabEscapes.current = false;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const current = code.slice(lineStart, start);
      const indent = (current.match(/^\s*/)?.[0] ?? "") + (/:\s*$/.test(current) ? INDENT : "");
      replace(start, end, `\n${indent}`, start + 1 + indent.length);
      return;
    }
    if (event.key === "Backspace" && start === end && start > 0) {
      // Delete a whole indent step at once when the caret sits in leading spaces.
      const before = code.slice(lineStart, start);
      if (before.length > 0 && /^ +$/.test(before)) {
        event.preventDefault();
        const remove = before.length % INDENT.length || INDENT.length;
        replace(start - remove, start, "", start - remove);
      }
    }
  };

  return (
    <div className="grid min-h-0 grid-cols-[48px_minmax(0,1fr)] overflow-hidden bg-[#1e1e1e]" style={{ minHeight }}>
      <div className="relative overflow-hidden border-r border-white/[0.07] bg-[#1b1b1b]" aria-hidden="true">
        <ol ref={gutter} className={`m-0 list-none py-4 pr-3 text-right text-[#6e6e73] ${TEXT}`}>
          {lines.map((_, index) => (
            <li key={index} className={index + 1 === errorLine ? "font-semibold text-[#ff7b7b]" : ""}>
              {index + 1}
            </li>
          ))}
        </ol>
      </div>
      <div className="relative min-h-0 overflow-hidden">
        {/* The highlighted copy under the textarea. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div ref={layer} className={`px-4 py-4 ${TEXT}`}>
            {lines.map((line, index) => (
              <div key={index} className={`-mx-4 px-4 ${index + 1 === errorLine ? "bg-[#ff5c5c]/[0.12] shadow-[inset_2px_0_0_#ff6b6b]" : ""}`}>
                {line
                  ? tokenizePython(line).map((token, tokenIndex) => (
                      <span key={tokenIndex} className={TOKEN_CLASSES[token.type]}>
                        {token.value}
                      </span>
                    ))
                  : "​"}
              </div>
            ))}
          </div>
        </div>
        <label className="absolute inset-0">
          <span className="sr-only">Python code editor</span>
          <textarea
            ref={textarea}
            className={`block size-full resize-none overflow-auto border-0 bg-transparent px-4 py-4 text-transparent caret-night-ink outline-none selection:bg-[#6699ec]/35 focus-visible:ring-2 focus-visible:ring-[#6699ec]/70 focus-visible:ring-inset disabled:cursor-default ${TEXT}`}
            value={code}
            disabled={disabled}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            wrap="off"
            aria-describedby="code-editor-keys"
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            onScroll={syncScroll}
          />
        </label>
        <span id="code-editor-keys" className="sr-only">
          Tab indents. Press Escape then Tab to leave the editor. {RUN_SHORTCUT} runs the code.
        </span>
      </div>
    </div>
  );
}
