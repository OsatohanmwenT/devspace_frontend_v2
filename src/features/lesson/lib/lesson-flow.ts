import type { ArticleContent, CodeEditorContent, Concept, Lesson, Milestone, Question } from "~/types/lesson";

type Context = { concept: Concept; conceptIndex: number; activityIndex: number };

export type FlowStep =
  | { kind: "skill-check"; id: string; concept: Concept; conceptIndex: number; quizTitle: string; quizIntro: string }
  | (Context & { kind: "activity"; id: string; type: "article"; content: ArticleContent })
  | (Context & { kind: "activity"; id: string; type: "code-editor"; content: CodeEditorContent })
  | (Context & {
      kind: "activity";
      id: string;
      type: "question";
      question: Question;
      quizId: string;
      questionIndex: number;
      questionCount: number;
    })
  | { kind: "transition"; id: string; concept: Concept; nextConcept: Concept; transition?: Milestone }
  | { kind: "complete"; id: string; completion: Milestone };

// A quiz block earns a dedicated "skill check" screen once it is long enough to
// feel like a real session. Below that, a full-screen interstitial before a
// single question is more interruption than the content justifies.
const SKILL_CHECK_SCREEN_THRESHOLD = 3;

// Quiz activities are flattened to one step per question, so a learner sees a
// single idea per screen and each progress segment maps to one thing to do.
function expandActivity(activity: Concept["activities"][number], context: Context): FlowStep[] {
  if (activity.type !== "quiz") return [{ ...activity, kind: "activity", ...context }];

  return activity.content.questions.map((question, questionIndex) => ({
    id: `${activity.id}-${question.id}`,
    kind: "activity",
    type: "question",
    question,
    quizId: activity.id,
    questionIndex,
    questionCount: activity.content.questions.length,
    ...context,
  }));
}

// The ordered screens of a lesson: for each concept its activities, a skill-check
// intro where earned, and a transition to the next concept; then the finish.
export function buildLessonFlow(lesson: Lesson): FlowStep[] {
  const flow: FlowStep[] = [];

  lesson.concepts.forEach((concept, conceptIndex) => {
    const { activities } = concept;
    const quizzes = activities.filter((activity) => activity.type === "quiz");
    const firstQuiz = quizzes[0];
    const hasArticleBefore = activities.some((activity) => activity.type === "article");

    // Every quiz in a concept runs back-to-back once the learner leaves the
    // article, as one check, so whether it earns a screen is decided once for
    // the whole run.
    const checkQuestionTotal = quizzes.reduce((sum, quiz) => sum + quiz.content.questions.length, 0);
    const needsSkillCheckScreen = hasArticleBefore && firstQuiz && checkQuestionTotal >= SKILL_CHECK_SCREEN_THRESHOLD;

    activities.forEach((activity, activityIndex) => {
      if (needsSkillCheckScreen && activity === firstQuiz) {
        flow.push({
          id: `${concept.id}-skill-check`,
          kind: "skill-check",
          concept,
          conceptIndex,
          quizTitle: firstQuiz.content.title,
          quizIntro: firstQuiz.content.intro,
        });
      }
      flow.push(...expandActivity(activity, { concept, conceptIndex, activityIndex }));
    });

    if (conceptIndex < lesson.concepts.length - 1) {
      flow.push({
        id: `${concept.id}-transition`,
        kind: "transition",
        concept,
        nextConcept: lesson.concepts[conceptIndex + 1],
        transition: concept.transition,
      });
    }
  });

  flow.push({ id: `${lesson.id}-complete`, kind: "complete", completion: lesson.completion });
  return flow;
}
