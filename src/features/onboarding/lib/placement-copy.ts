import { experienceOptions, javascriptExperienceOptions } from "../data/questions";
import type { Answers, Option } from "../types";
import {
    getExperienceRung,
    getJavascriptExperienceRung,
    getLadder,
    resolveRole,
} from "./resolve";

// One line per rung so the placement screen can say *why* rather than just
// *where*; the rung already drives placement, this narrates it.
const RUNG_SUMMARY: Record<number, string> = {
  1: "You’re just getting started",
  2: "You’ve tried the basics",
  3: "You’ve built things before",
  4: "You’ve worked on real projects",
};

function getExperienceAnswerLabel(answers: Answers) {
  const isFrontend = resolveRole(answers) === "frontend_developer";
  const options = isFrontend ? javascriptExperienceOptions : experienceOptions;
  const value = isFrontend ? answers.javascriptExperience : answers.experience;
  return options.find((option) => option.value === value)?.label ?? null;
}

// Structured pieces for the placement screen's sentence.
export function explainPlacement(answers: Answers, placement: Option | null, roleLabel: string) {
  if (!placement || !roleLabel || !getExperienceAnswerLabel(answers)) return null;

  const rung =
    resolveRole(answers) === "frontend_developer"
      ? getJavascriptExperienceRung(answers.javascriptExperience)
      : getExperienceRung(answers.experience);
  const rungSummary = RUNG_SUMMARY[Math.min(rung, 4)] ?? RUNG_SUMMARY[1];

  const ladder = getLadder(answers);
  const skipsAhead = ladder.length > 0 && ladder[0].value !== placement.value;

  return {
    rungSummary,
    tail: skipsAhead
      ? `so we’d skip the very beginning and start you at ${placement.label}.`
      : `so we’ll start you right at the beginning, with ${placement.label}.`,
  };
}
