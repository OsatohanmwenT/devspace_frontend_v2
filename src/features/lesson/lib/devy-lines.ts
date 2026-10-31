// Devy has no model behind it here: the one-liner it says from the footer is an
// ambient reaction to what just happened, picked from a small pool so the same
// moment does not read the same line twice in a row.
const LINES = {
  correct: ["Nice — that’s it.", "Exactly right.", "Yep, that’s the one.", "Clean answer."],
  // A wrong answer that still has a retry left.
  retry: ["Not quite, give it another shot.", "Close. Try again.", "Not this one, have another go."],
  // The final, resolved miss.
  wrong: ["Not quite — check the hint if you want.", "Close, but not that one.", "Not this time. I’m right here if you need me."],
};

const pick = (pool: string[]) => pool[Math.floor(Math.random() * pool.length)];

export const getDevyLine = (event: keyof typeof LINES) => pick(LINES[event]);
export const getStreakLine = (streak: number) => `${streak} correct in a row — you’re finding a rhythm.`;

// Said, in turn, while an article is on screen.
export const ARTICLE_LINES = ["Take this one at your pace.", "Keep an eye on the part you could actually use.", "You do not need to memorise it all yet."];
