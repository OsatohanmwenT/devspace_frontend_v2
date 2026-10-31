"use client";

import { useState } from "react";
import { Drawer } from "~/components/ui/drawer";

const storageKey = (lessonId: string) => `devspace-lesson-notes:${lessonId}`;

function loadNotes(lessonId: string): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(lessonId)) ?? "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

type NotesDrawerProps = { lessonId: string; lessonTitle: string; conceptTitle?: string; onClose: () => void };

// A scratchpad for the lesson, kept in this browser.
export function NotesDrawer({ lessonId, lessonTitle, conceptTitle, onClose }: NotesDrawerProps) {
  const [notes, setNotes] = useState(() => loadNotes(lessonId));
  const [draft, setDraft] = useState("");

  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    const next = [...notes, text];
    setNotes(next);
    setDraft("");
    try {
      localStorage.setItem(storageKey(lessonId), JSON.stringify(next));
    } catch {
      // Storage blocked: the note stays for this sitting only.
    }
  };

  return (
    <Drawer title="Notes" subtitle={conceptTitle ? `${lessonTitle} · ${conceptTitle}` : lessonTitle} onClose={onClose}>
      <div className="grid gap-5">
        <label className="sr-only" htmlFor="lesson-note">
          Write a note
        </label>
        <textarea
          id="lesson-note"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Write a note…"
          className="min-h-[132px] w-full resize-y rounded-xl border border-[#e1e1e1] bg-white px-4 py-3 text-[15px] leading-[1.55] text-neutral-800 placeholder:text-ink-soft focus:border-[#6699ec] focus:outline-none dark:border-night-line dark:bg-night-card dark:text-night-ink dark:placeholder:text-[#89898e]"
        />
        <button
          type="button"
          onClick={addNote}
          disabled={!draft.trim()}
          className="focus-ring justify-self-start rounded-xl bg-[#5541ed] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_3px_0_#3828b8] transition-colors hover:bg-[#6655f2] disabled:cursor-not-allowed disabled:bg-[#7771bb] disabled:shadow-none"
        >
          + Add note
        </button>

        <div className="border-t border-[#e1e1e1] pt-5 dark:border-night-line">
          {notes.length === 0 ? (
            <p className="m-0 text-[15px] leading-[1.55] text-ink-soft dark:text-night-soft">No notes on this lesson yet.</p>
          ) : (
            <ul className="m-0 grid list-none gap-3 p-0">
              {notes.map((note, index) => (
                <li key={`${note}-${index}`} className="rounded-xl bg-[#f5f5f5] px-4 py-3 text-[15px] leading-[1.55] text-[#454545] dark:bg-[#262626] dark:text-[#d7d7da]">
                  {note}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Drawer>
  );
}
