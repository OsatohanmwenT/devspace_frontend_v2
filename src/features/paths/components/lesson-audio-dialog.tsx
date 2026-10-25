"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import lessonAudio from "../data/lesson-audio.json";

type AudioLesson = (typeof lessonAudio)[keyof typeof lessonAudio];

const RATES = [0.75, 1, 1.25, 1.5, 2];

export function LessonAudioDialog({ lesson, onClose }: { lesson: AudioLesson; onClose: () => void }) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [chapterIndex, setChapterIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(() => typeof window === "undefined" ? 1 : Number(localStorage.getItem("devspace-narration-rate")) || 1);
  const run = useRef(0);
  const chapter = lesson.chapters[chapterIndex];

  useEffect(() => {
    return () => {
      run.current += 1;
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [onClose]);

  const speak = (index: number, speed: number) => {
    if (!supported || !lesson.chapters[index]) return;
    run.current += 1;
    const currentRun = run.current;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lesson.chapters[index].text);
    utterance.rate = speed;
    const preferredVoice = localStorage.getItem("devspace-narration-voice");
    if (preferredVoice) utterance.voice = window.speechSynthesis.getVoices().find((voice) => voice.name === preferredVoice) ?? null;
    utterance.onend = () => {
      if (run.current !== currentRun) return;
      if (index + 1 < lesson.chapters.length) {
        setChapterIndex(index + 1);
        speak(index + 1, speed);
      } else {
        setPlaying(false);
        setPaused(false);
      }
    };
    utterance.onerror = () => {
      if (run.current !== currentRun) return;
      setPlaying(false);
      setPaused(false);
    };
    setChapterIndex(index);
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
    setPaused(false);
  };

  return (
    <motion.div
      role="presentation"
      className="fixed inset-0 z-40 grid place-items-center bg-black/65 p-5 backdrop-blur-sm"
      onMouseDown={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-audio-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="grid w-full max-w-[560px] gap-6 rounded-3xl border border-[#e0e0dc] bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,.45)] max-tab:p-5 dark:border-night-line dark:bg-night-card"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[.1em] text-[#2563eb] uppercase dark:text-[#88bdf2]">Listen</p>
            <h2 id="lesson-audio-title" className="mt-1.5 text-2xl font-semibold text-ink dark:text-night-ink">{lesson.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close audio" className="focus-ring grid size-9 place-items-center rounded-lg text-ink-soft hover:bg-[#f5f5f5] dark:text-night-soft dark:hover:bg-[#262626]">
            <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </header>

        {!supported ? (
          <p className="text-sm text-ink-soft dark:text-night-soft">Your browser doesn’t support read-aloud narration. You can still see the chapters below.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              aria-label={playing && !paused ? "Pause" : "Play"}
              onClick={() => {
                if (!playing) speak(chapterIndex, rate);
                else if (paused) { window.speechSynthesis.resume(); setPaused(false); }
                else { window.speechSynthesis.pause(); setPaused(true); }
              }}
              className="focus-ring grid size-14 flex-none place-items-center rounded-full bg-[#2563eb] text-white hover:bg-[#3b82f6]"
            >
              {playing && !paused ? <span className="text-xl">Ⅱ</span> : <span className="text-xl">▶</span>}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink dark:text-night-ink">{chapter?.title}</p>
              <p className="mt-0.5 text-xs text-ink-soft dark:text-night-soft">Chapter {chapterIndex + 1} of {lesson.chapters.length} · {chapter?.conceptTitle}</p>
            </div>
            <div role="group" aria-label="Playback speed" className="flex gap-1">
              {RATES.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  aria-pressed={rate === speed}
                  onClick={() => {
                    setRate(speed);
                    localStorage.setItem("devspace-narration-rate", String(speed));
                    if (playing) speak(chapterIndex, speed);
                  }}
                  className={`focus-ring min-h-8 rounded-full border px-2.5 text-xs font-medium ${rate === speed ? "border-[#2563eb] bg-[#2563eb] text-white" : "border-[#d4d4d4] text-ink-soft hover:border-[#6699ec] dark:border-night-line dark:text-night-soft"}`}
                >{speed}x</button>
              ))}
            </div>
          </div>
        )}

        <ol className="grid gap-1">
          {lesson.chapters.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                disabled={!supported}
                onClick={() => speak(index, rate)}
                className={`focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left disabled:cursor-not-allowed ${index === chapterIndex ? "bg-[#eff4ff] dark:bg-[#1d2f5d]" : "hover:bg-[#f5f5f5] dark:hover:bg-[#262626]"}`}
              >
                <span className={`grid size-6 flex-none place-items-center rounded-full text-xs font-semibold ${index === chapterIndex ? "bg-[#2563eb] text-white" : "bg-[#f1f1ef] text-ink-soft dark:bg-[#2b2b2e] dark:text-night-soft"}`}>{index + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink dark:text-night-ink">{item.title}</span>
                  <span className="block truncate text-xs text-ink-soft dark:text-night-soft">{item.conceptTitle}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </motion.section>
    </motion.div>
  );
}
