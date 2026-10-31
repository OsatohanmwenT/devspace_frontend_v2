import type { ArticleContent, RichText } from "~/types/lesson";

export const NARRATION_RATES = [0.75, 1, 1.25, 1.5, 2];

const RATE_KEY = "devspace-narration-rate";
const VOICE_KEY = "devspace-narration-voice";
const AUTO_PLAY_KEY = "devspace-narration-autoplay";
const PERSONALITY_KEY = "devspace-narration-personality";

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the choice holds for this sitting only.
  }
};

export const readRate = () => Number(read(RATE_KEY)) || 1;
export const readVoiceName = () => read(VOICE_KEY) ?? "";
export const readAutoPlay = () => read(AUTO_PLAY_KEY) === "true";
export const readPersonality = () => read(PERSONALITY_KEY) === "true";
export const saveRate = (rate: number) => write(RATE_KEY, String(rate));
export const saveVoiceName = (name: string) => write(VOICE_KEY, name);
export const saveAutoPlay = (on: boolean) => write(AUTO_PLAY_KEY, String(on));
export const savePersonality = (on: boolean) => write(PERSONALITY_KEY, String(on));

export const speechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

// Rich text can carry inline code and emphasis; narration only needs the words.
export function flattenRichText(content: RichText) {
  const parts = Array.isArray(content) ? content : [content];
  return parts.map((part) => (typeof part === "string" ? part : "code" in part ? part.code : part.strong)).join("");
}

// Diagrams and examples are visual by design: narration covers the prose
// (title, intro, section bodies) a learner would otherwise read.
export function articleToSpeech(article: ArticleContent) {
  return [article.title, article.intro, ...article.sections.flatMap((section) => [section.title, flattenRichText(section.body)])].filter(Boolean).join(". ");
}

// Devy's commentary: reacts to the content rather than reading it verbatim.
// It falls back section by section to the on-screen text, so a lesson can have
// personality lines for some sections and never go silent on a gap.
export function articleToSpeechPersonality(article: ArticleContent) {
  return [article.spokenIntro ?? article.intro, ...article.sections.map((section) => section.spoken ?? flattenRichText(section.body))].filter(Boolean).join(" ");
}

// One short line, independent of the article narration's own state, for a quiz
// intro or a right/wrong reaction. It uses the learner's saved speed and voice,
// so every spoken line in a lesson sounds consistent.
export function speakText(text: string) {
  if (!speechSupported() || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = readRate();
  const name = readVoiceName();
  const voice = name ? window.speechSynthesis.getVoices().find((candidate) => candidate.name === name) : undefined;
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}
