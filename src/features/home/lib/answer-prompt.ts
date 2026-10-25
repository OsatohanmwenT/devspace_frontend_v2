// Devy's answers on Home: the learner's real path and next lesson where it
// helps, otherwise a short pointer to what Devy can do. There is no model
// behind it; every answer is chosen from what the learner typed.
export function answerHomePrompt(prompt: string, pathTitle?: string, nextLesson?: string | null) {
  if (prompt.includes("next") || prompt.includes("quick")) {
    return nextLesson
      ? `Your best next step is ${nextLesson} in ${pathTitle}. It keeps your path moving without asking you to choose from scratch.`
      : "Open a path and I will help you choose a useful next step.";
  }
  if (prompt.includes("practice")) {
    return "Practice is a short way to strengthen one skill. Pick a session that fits the time you have, then return to your path when you are ready.";
  }
  if (prompt.includes("league") || prompt.includes("XP") || prompt.includes("week")) {
    return "Lessons and practice earn XP. Your weekly total decides your league position, so a short session still counts.";
  }
  if (prompt.includes("path")) {
    return "A path is a sequence of lessons that builds toward a practical goal. You can explore any path and still keep your current progress.";
  }
  if (prompt.includes("doing")) {
    return `You are currently working through ${pathTitle}. Small, regular sessions are the easiest way to make progress.`;
  }
  return "I can help with what is on this page. Try one of the suggestions above, or ask about your next lesson, practice, or learning path.";
}
