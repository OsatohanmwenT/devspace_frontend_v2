"use client";

import { play } from "cuelume";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { DevyLottie, DevyMood } from "~/components/devy";
import { ChecklistIcon } from "~/components/ui/icons";
import { CheatsheetDrawer, getCheatsheetPersonalization, getLessonTopics } from "~/features/paths";
import { getProfile } from "~/features/profile";
import { getProgressSummary } from "~/features/progress";
import { useLoad } from "~/hooks/use-load";
import type { Lesson } from "~/types/lesson";
import type { Profile } from "~/types/profile";
import { completeLesson, getLesson } from "../api/lesson-api";
import { useNarrationPersonality } from "../hooks/use-lesson-narration";
import { speakText, speechSupported } from "../lib/narration";
import { clearSession, STREAK_THRESHOLD, useLessonSession } from "../hooks/use-lesson-session";
import { ARTICLE_LINES, getDevyLine, getStreakLine } from "../lib/devy-lines";
import { buildLessonFlow } from "../lib/lesson-flow";
import { isFillQuestion } from "../lib/question-state";
import { ConceptTransition } from "./concept-transition";
import { LessonArticle } from "./lesson-article";
import { NarrationControl } from "./narration-control";
import { DevyAssistant } from "./devy-assistant";
import { LessonCompleteSequence } from "./lesson-complete-sequence";
import { LessonDialog } from "./lesson-dialog";
import { LessonFooter, type FooterAction } from "./lesson-footer";
import { LessonCodeEditor } from "./lesson-code-editor";
import { LessonHeader } from "./lesson-header";
import { LessonLoading } from "./lesson-loading";
import { LessonProgressStrip } from "./lesson-progress-strip";
import { NotesDrawer } from "./notes-drawer";
import { LessonQuestion } from "./lesson-question";
import { UnavailableLesson } from "./unavailable-lesson";

// How long Devy's one-liner stays up before it fades.
const LINE_MS = 4200;
// The loader's beat between the path page and the lesson.
const LOADING_MS = 3000;

const GLOW = {
  success: "shadow-[inset_0_0_0_2px_#197a4b,inset_0_0_46px_-8px_#197a4b] dark:shadow-[inset_0_0_0_2px_#6ee7a8,inset_0_0_46px_-8px_#6ee7a8]",
  error: "shadow-[inset_0_0_0_2px_#b3261e,inset_0_0_46px_-8px_#ff676d] dark:shadow-[inset_0_0_0_2px_#ff676d,inset_0_0_46px_-8px_#ff676d]",
};

function LessonScreen({ lesson, xp, profile }: { lesson: Lesson; xp: number; profile: Profile | null }) {
  const router = useRouter();
  const flow = buildLessonFlow(lesson);
  const session = useLessonSession(lesson.id, flow);
  const { step, question } = session;

  const [menuOpen, setMenuOpen] = useState(false);
  const [cheatsheetOpen, setCheatsheetOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [successPulse, setSuccessPulse] = useState(0);
  const [errorPulse, setErrorPulse] = useState(0);
  const [line, setLine] = useState<{ text: string } | undefined>();
  const [notesOpen, setNotesOpen] = useState(false);
  const { personality, changePersonality } = useNarrationPersonality();
  // Set once the article has been read aloud, which relabels the footer button.
  const [audioDone, setAudioDone] = useState(false);
  const [devyOpen, setDevyOpen] = useState(false);
  const [earnItFirstOpen, setEarnItFirstOpen] = useState(false);
  // What Devy said from the footer lately, which the chat panel keeps as context.
  const [recentLines, setRecentLines] = useState<string[]>([]);
  // The panel's width, resizable by its edge, never wider than a quarter of the screen.
  const [panelWidth, setPanelWidth] = useState(() => Math.round(Math.max(320, window.innerWidth * 0.25)));
  const resizeStart = useRef<{ x: number; width: number } | null>(null);

  const topics = getLessonTopics(lesson.id);
  const isMilestone = step.kind !== "activity";
  const isQuestion = step.kind === "activity" && step.type === "question";
  const isCodeEditor = step.kind === "activity" && step.type === "code-editor";
  const streaking = session.streak >= STREAK_THRESHOLD;
  const devyPanelOpen = devyOpen && !isMilestone && !isCodeEditor;

  // A new object each time, so saying the same words twice restarts the fade.
  const sayLine = (text: string, spoken = false) => {
    if (spoken && personality) speakText(text);
    setLine({ text });
    setRecentLines((lines) => [...lines, text].slice(-4));
  };

  useEffect(() => {
    if (!line) return;
    const timer = window.setTimeout(() => setLine(undefined), LINE_MS);
    return () => window.clearTimeout(timer);
  }, [line]);

  const resetReactions = () => {
    setSuccessPulse(0);
    setErrorPulse(0);
    setLine(undefined);
    setDevyOpen(false);
    setAudioDone(false);
  };

  const goNext = () => {
    // Stepping onto the last screen is finishing: ask once what it paid.
    if (flow[session.stepIndex + 1]?.kind === "complete" && !session.finished) completeLesson(lesson.id, session.assisted).then(session.finish);
    session.next();
    resetReactions();
  };

  const goPrevious = () => {
    session.previous();
    resetReactions();
  };

  // Devy talks while an article is on screen, one line at a time.
  const articleId = step.kind === "activity" && step.type === "article" ? step.id : null;
  useEffect(() => {
    if (!articleId) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delays = reduced ? [0] : [0, 2400, 4800];
    const timers = ARTICLE_LINES.slice(0, delays.length).map((text, index) => window.setTimeout(() => sayLine(text), delays[index]));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [articleId]);

  // Devy introduces the quiz aloud as its first question or skill check appears.
  const firstQuestionId = isQuestion ? flow.find((candidate) => candidate.kind === "activity" && candidate.type === "question" && candidate.concept.id === step.concept.id)?.id : undefined;
  const spokenIntro = step.kind === "skill-check" ? step.quizIntro : firstQuestionId === step.id ? "Quick check before we move on." : undefined;
  const introduceQuiz = useEffectEvent((text: string) => {
    if (personality) speakText(text);
  });
  useEffect(() => {
    if (spokenIntro) introduceQuiz(spokenIntro);
    return () => {
      if (speechSupported()) window.speechSynthesis.cancel();
    };
  }, [spokenIntro]);

  // Lock page scroll for the lesson's lifetime.
  useEffect(() => {
    const previous = [document.body.style.overflow, document.documentElement.style.overflow];
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      [document.body.style.overflow, document.documentElement.style.overflow] = previous;
    };
  }, []);

  const checkQuestion = () => {
    const outcome = question.check();
    if (outcome === "retry") {
      setErrorPulse((count) => count + 1);
      play("error");
      sayLine(getDevyLine("retry"), true);
      return;
    }
    if (outcome === "correct") {
      setSuccessPulse((count) => count + 1);
      play("success");
      const nextStreak = session.streak + 1;
      sayLine(nextStreak >= STREAK_THRESHOLD ? getStreakLine(nextStreak) : getDevyLine("correct"), true);
      return;
    }
    setErrorPulse((count) => count + 1);
    play("error");
    sayLine(getDevyLine("wrong"), true);
  };

  // Gate, don't block: an unanswered question is the one place asking Devy has a
  // real cost, and only the first time. Once assisted, the reward is already
  // gone, so later questions open Devy freely.
  const openDevy = () => {
    if (isQuestion && !question.checked && !session.assisted) {
      setEarnItFirstOpen(true);
      return;
    }
    setDevyOpen(true);
  };

  const askDevyAnyway = () => {
    setEarnItFirstOpen(false);
    session.markAssisted();
    setDevyOpen(true);
  };

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    resizeStart.current = { x: event.clientX, width: panelWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const resizePanel = (event: React.PointerEvent) => {
    if (!resizeStart.current) return;
    const next = resizeStart.current.width + event.clientX - resizeStart.current.x;
    setPanelWidth(Math.round(Math.min(Math.max(next, 320), Math.max(320, window.innerWidth * 0.25))));
  };

  const leave = useCallback(() => {
    clearSession(lesson.id);
    if (window.history.length > 1) router.back();
    else router.push("/paths");
  }, [lesson.id, router]);

  // After the audio finishes, say where Continue leads.
  const nextStep = flow[session.stepIndex + 1];
  const nextLabel = nextStep?.kind === "activity" && nextStep.type === "question" ? "Start quick check" : "Continue lesson";

  const footerAction: FooterAction | null =
    step.kind === "transition"
      ? { label: "Continue", onClick: goNext }
      : step.kind === "skill-check"
        ? { label: "Start skill check", onClick: goNext }
        : step.kind === "complete" || isCodeEditor
            ? null
            : isQuestion
              ? question.checked
                ? { label: "Continue", onClick: goNext }
                : { label: question.attempts > 0 ? "Try again" : "Check", onClick: checkQuestion, disabled: !question.canCheck }
              : { label: audioDone ? nextLabel : "Continue", onClick: goNext };

  // Ctrl/Cmd+Enter drives the primary action; number keys pick an option.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (exitOpen || cheatsheetOpen || notesOpen || earnItFirstOpen) return;
      // Escape in the code editor is its "leave the field" key, not an exit request.
      if (event.key === "Escape") {
        if (!menuOpen && !(event.target instanceof HTMLTextAreaElement)) setExitOpen(true);
        return;
      }
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        if (footerAction && !footerAction.disabled) {
          event.preventDefault();
          footerAction.onClick();
        }
        return;
      }
      if (!isQuestion || question.checked || isFillQuestion(step.question)) return;
      const digit = Number(event.key);
      if (Number.isInteger(digit) && digit >= 1 && digit <= step.question.options.length) {
        event.preventDefault();
        question.setAnswer(digit - 1);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  const recap = session.recap();

  return (
    <section
      className={`fixed inset-0 z-20 grid overflow-hidden bg-canvas text-neutral-800 dark:bg-[#121212] dark:text-night-ink ${
        isMilestone ? "grid-rows-[minmax(0,1fr)]" : isCodeEditor ? "grid-rows-[64px_minmax(0,1fr)]" : "grid-rows-[64px_minmax(0,1fr)_76px] max-[720px]:grid-rows-[64px_minmax(0,1fr)_68px]"
      }`}
      aria-label="Lesson"
      style={{ "--devy-panel-width": `${panelWidth}px` } as React.CSSProperties}
    >
      {successPulse > 0 && <div key={successPulse} className={`pointer-events-none absolute inset-0 z-60 animate-lesson-glow ${GLOW.success}`} aria-hidden="true" />}
      {errorPulse > 0 && <div key={errorPulse} className={`pointer-events-none absolute inset-0 z-60 animate-lesson-glow ${GLOW.error}`} aria-hidden="true" />}

      {/* Break screens (between concepts, skill check, lesson complete) are full
          screen: no header or footer, just the moment and its button. */}
      {!isMilestone && (
        <LessonHeader
          xp={xp}
          menuOpen={menuOpen}
          onMenuOpenChange={setMenuOpen}
          onExit={() => {
            setMenuOpen(false);
            setExitOpen(true);
          }}
          onOpenNotes={() => setNotesOpen(true)}
          narration={
            step.kind === "activity" && step.type === "article" ? (
              <NarrationControl key={step.id} article={step.content} personality={personality} onPersonalityChange={changePersonality} onStart={() => setAudioDone(false)} onEnd={() => setAudioDone(true)} />
            ) : undefined
          }
          onOpenCheatsheet={topics.length > 0 ? () => setCheatsheetOpen(true) : undefined}
          progress={
            <LessonProgressStrip
              currentStep={session.stepIndex + 1}
              totalSteps={flow.length}
              onPrevious={session.stepIndex > 0 ? goPrevious : undefined}
              onNext={!session.isLastStep && (!isQuestion || question.checked) && (!isCodeEditor || session.editor.completed) ? goNext : undefined}
              streaking={streaking}
            />
          }
        />
      )}

      <main className={`min-h-0 min-w-0 overflow-auto transition-[margin-left] duration-[180ms] ease-in-out ${devyPanelOpen ? "ml-[var(--devy-panel-width)] max-[720px]:mt-[min(42vh,340px)] max-[720px]:ml-0" : ""}`}>
        {step.kind === "activity" && step.type === "article" && <LessonArticle article={step.content} lessonTitle={lesson.title} />}
        {step.kind === "activity" && step.type === "question" && (
          <div className="mx-auto grid min-h-full w-[min(100%,760px)] place-items-center px-7 py-10 max-[720px]:px-5 max-[720px]:py-6">
            <LessonQuestion key={step.id} question={step.question} answer={question.answer} checked={question.checked} retrying={question.retrying} onAnswer={question.setAnswer} onAskDevy={openDevy} />
          </div>
        )}
        {step.kind === "activity" && step.type === "code-editor" && (
          <LessonCodeEditor
            key={step.id}
            content={step.content}
            code={session.editor.code}
            completed={session.editor.completed}
            onCodeChange={session.editor.update}
            onComplete={() => {
              session.editor.complete();
              setSuccessPulse((count) => count + 1);
              play("success");
            }}
            onContinue={goNext}
          />
        )}
        {step.kind === "transition" && (
          <ConceptTransition title={`That’s ${step.concept.title} done`} body={`You’re ready for ${step.nextConcept.title}`} clip="walk" action={footerAction ?? undefined} onExit={() => setExitOpen(true)} />
        )}
        {step.kind === "skill-check" && (
          <ConceptTransition
            eyebrow="Skill check"
            title={step.quizTitle}
            body={step.quizIntro}
            badge={<ChecklistIcon className="size-5" />}
            action={footerAction ?? undefined}
            onExit={() => setExitOpen(true)}
          />
        )}
        {step.kind === "complete" && session.finished && (
          <LessonCompleteSequence
            title={step.completion.title}
            body={step.completion.body}
            reward={session.finished.reward}
            accuracy={recap.total ? Math.round((recap.correct / recap.total) * 100) : null}
            seconds={session.finished.seconds}
            onFinish={leave}
            onExit={() => setExitOpen(true)}
          />
        )}
      </main>

      {!isMilestone && !isCodeEditor && (
        <aside
          className={`absolute top-16 bottom-0 left-0 z-1 flex w-[var(--devy-panel-width)] flex-col border-r border-[#e1e1e1] bg-white p-5 transition-transform duration-[180ms] ease-in-out max-[720px]:top-[60px] max-[720px]:w-full max-[720px]:border-r-0 max-[720px]:border-b dark:border-night-line dark:bg-night-card ${devyPanelOpen ? "translate-x-0" : "-translate-x-full"}`}
          aria-label="Devy chat"
          inert={!devyPanelOpen}
        >
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize Devy chat"
            className="absolute top-0 right-0 hidden h-full w-2 translate-x-1/2 cursor-col-resize touch-none before:absolute before:inset-y-0 before:left-1/2 before:w-px hover:before:bg-[#6699ec] active:before:bg-[#6699ec] md:block"
            onPointerDown={startResize}
            onPointerMove={resizePanel}
            onPointerUp={() => (resizeStart.current = null)}
            onPointerCancel={() => (resizeStart.current = null)}
          />
          <DevyAssistant
            key={step.id}
            step={step}
            checked={isQuestion && question.checked}
            profile={profile}
            recentLines={recentLines}
            lessonTitle={lesson.title}
            onClose={() => setDevyOpen(false)}
          />
        </aside>
      )}
      {!isMilestone && !isCodeEditor && (
        <div className={`transition-[margin-left] duration-[180ms] ease-in-out ${devyPanelOpen ? "ml-[var(--devy-panel-width)] max-[720px]:ml-0" : ""}`}>
          <LessonFooter action={footerAction} line={line?.text} streaking={streaking} onOpenDevy={openDevy} devyOpen={devyOpen} note={audioDone && step.kind === "activity" && step.type === "article" ? "Audio complete" : undefined} />
        </div>
      )}

      {notesOpen && <NotesDrawer lessonId={lesson.id} lessonTitle={lesson.title} conceptTitle={step.kind === "activity" ? step.concept.title : undefined} onClose={() => setNotesOpen(false)} />}
      {earnItFirstOpen && (
        <LessonDialog
          eyebrow="Earn It First"
          title="Try it yourself first."
          body="Asking Devy now costs this lesson its XP and coins. Devy can still rule out a wrong option, just not hand you the answer."
          media={<DevyLottie clip="thinking" className="mb-4 h-[102px] w-[90px]" />}
          stayLabel="Keep trying"
          leaveLabel="Ask Devy anyway"
          leaveTone="calm"
          onStay={() => setEarnItFirstOpen(false)}
          onLeave={askDevyAnyway}
        />
      )}

      {cheatsheetOpen && (
        <CheatsheetDrawer
          subtitle={lesson.title}
          topics={topics}
          personalization={getCheatsheetPersonalization({ rung: profile?.rung ?? 2, immediateNeed: profile?.immediateNeed ?? [] })}
          onClose={() => setCheatsheetOpen(false)}
        />
      )}
      {exitOpen && (
        <LessonDialog
          title="Wait, don’t go! You’ll lose your progress and XP if you leave now."
          media={<DevyMood mood="annoyed" className="mb-4 h-[102px] w-[90px] object-contain" />}
          stayLabel="Keep learning"
          leaveLabel="Leave lesson"
          onStay={() => setExitOpen(false)}
          onLeave={leave}
        />
      )}
    </section>
  );
}

// Loads the lesson, plays the "preparing" beat, then hands over to the lesson.
export function LessonView({ lessonId }: { lessonId: string }) {
  const router = useRouter();
  const load = useCallback(() => Promise.all([getLesson(lessonId), getProgressSummary(), getProfile()]), [lessonId]);
  const loaded = useLoad(load);
  const [prepared, setPrepared] = useState(false);
  // Bumped when the lesson goes away, so every visit mounts a fresh screen.
  const [visit, setVisit] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPrepared(true), reduced ? 0 : LOADING_MS);
    return () => {
      window.clearTimeout(timer);
      // Next keeps a left page alive and restores it as it was, so an open
      // exit dialog or a half-finished lesson would greet the next visit. Start
      // over, loading screen included.
      setPrepared(false);
      setVisit((count) => count + 1);
    };
  }, []);

  if (loaded.status === "error") return <UnavailableLesson lessonId={lessonId} onBack={() => router.push("/paths")} />;
  if (loaded.status !== "ready") return <LessonLoading title="Your lesson" />;

  const [lesson, summary, profile] = loaded.data;
  if (!lesson) return <UnavailableLesson lessonId={lessonId} onBack={() => router.push("/paths")} />;
  if (!prepared) return <LessonLoading title={lesson.title} />;
  return <LessonScreen key={visit} lesson={lesson} xp={summary.xp} profile={profile} />;
}
