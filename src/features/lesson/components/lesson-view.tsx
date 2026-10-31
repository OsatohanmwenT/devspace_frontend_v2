"use client";

import { play } from "cuelume";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DevyMood } from "~/components/devy";
import { ChecklistIcon } from "~/components/ui/icons";
import { CheatsheetDrawer, getCheatsheetPersonalization, getLessonTopics } from "~/features/paths";
import { getProfile } from "~/features/profile";
import { getProgressSummary } from "~/features/progress";
import { useLoad } from "~/hooks/use-load";
import type { Lesson } from "~/types/lesson";
import type { Profile } from "~/types/profile";
import { completeLesson, getLesson } from "../api/lesson-api";
import { clearSession, STREAK_THRESHOLD, useLessonSession } from "../hooks/use-lesson-session";
import { ARTICLE_LINES, getDevyLine, getStreakLine } from "../lib/devy-lines";
import { buildLessonFlow } from "../lib/lesson-flow";
import { isFillQuestion } from "../lib/question-state";
import { ConceptTransition } from "./concept-transition";
import { LessonArticle } from "./lesson-article";
import { LessonCompleteSequence } from "./lesson-complete-sequence";
import { LessonDialog } from "./lesson-dialog";
import { LessonFooter, type FooterAction } from "./lesson-footer";
import { LessonCodeEditor } from "./lesson-code-editor";
import { LessonHeader } from "./lesson-header";
import { LessonLoading } from "./lesson-loading";
import { LessonProgressStrip } from "./lesson-progress-strip";
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

  const topics = getLessonTopics(lesson.id);
  const isMilestone = step.kind !== "activity";
  const isQuestion = step.kind === "activity" && step.type === "question";
  const isCodeEditor = step.kind === "activity" && step.type === "code-editor";
  const streaking = session.streak >= STREAK_THRESHOLD;

  // A new object each time, so saying the same words twice restarts the fade.
  const sayLine = (text: string) => setLine({ text });

  useEffect(() => {
    if (!line) return;
    const timer = window.setTimeout(() => setLine(undefined), LINE_MS);
    return () => window.clearTimeout(timer);
  }, [line]);

  const resetReactions = () => {
    setSuccessPulse(0);
    setErrorPulse(0);
    setLine(undefined);
  };

  const goNext = () => {
    // Stepping onto the last screen is finishing: ask once what it paid.
    if (flow[session.stepIndex + 1]?.kind === "complete" && !session.finished) completeLesson(lesson.id).then(session.finish);
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
    const timers = ARTICLE_LINES.slice(0, delays.length).map((text, index) => window.setTimeout(() => setLine({ text }), delays[index]));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [articleId]);

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
      sayLine(getDevyLine("retry"));
      return;
    }
    if (outcome === "correct") {
      setSuccessPulse((count) => count + 1);
      play("success");
      const nextStreak = session.streak + 1;
      sayLine(nextStreak >= STREAK_THRESHOLD ? getStreakLine(nextStreak) : getDevyLine("correct"));
      return;
    }
    setErrorPulse((count) => count + 1);
    play("error");
    sayLine(getDevyLine("wrong"));
  };

  const leave = useCallback(() => {
    clearSession(lesson.id);
    if (window.history.length > 1) router.back();
    else router.push("/paths");
  }, [lesson.id, router]);

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
              : { label: "Continue", onClick: goNext };

  // Ctrl/Cmd+Enter drives the primary action; number keys pick an option.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (exitOpen || cheatsheetOpen) return;
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

      <main className="min-h-0 min-w-0 overflow-auto">
        {step.kind === "activity" && step.type === "article" && <LessonArticle article={step.content} lessonTitle={lesson.title} />}
        {step.kind === "activity" && step.type === "question" && (
          <div className="mx-auto grid min-h-full w-[min(100%,760px)] place-items-center px-7 py-10 max-[720px]:px-5 max-[720px]:py-6">
            <LessonQuestion key={step.id} question={step.question} answer={question.answer} checked={question.checked} retrying={question.retrying} onAnswer={question.setAnswer} />
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

      {!isMilestone && !isCodeEditor && <LessonFooter action={footerAction} line={line?.text} streaking={streaking} />}

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

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPrepared(true), reduced ? 0 : LOADING_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (loaded.status === "error") return <UnavailableLesson lessonId={lessonId} onBack={() => router.push("/paths")} />;
  if (loaded.status !== "ready") return <LessonLoading title="Your lesson" />;

  const [lesson, summary, profile] = loaded.data;
  if (!lesson) return <UnavailableLesson lessonId={lessonId} onBack={() => router.push("/paths")} />;
  if (!prepared) return <LessonLoading title={lesson.title} />;
  return <LessonScreen lesson={lesson} xp={summary.xp} profile={profile} />;
}
