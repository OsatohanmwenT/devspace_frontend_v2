// The illustrations already used for path regions, matched to what a stage
// teaches so a card shows a picture of the thing rather than an empty panel.
// Keyed by the tech a stage maps to (see stageIcon); anything unmatched falls
// back through a fixed rotation so every card still gets art.
const THINKING = "art/thinking-in-code.png";
const VARIABLES = "art/programming-with-variables.png";
const DATA = "art/exploring-data-visually.png";
const SCIENCE = "art/scientific-thinking.png";
const CHANCE = "art/probability-and-chance.png";

export const STAGE_ART: Partial<Record<string, string>> = {
  js: THINKING,
  typescript: THINKING,
  react: THINKING,
  vue: THINKING,
  angular: THINKING,
  markup: THINKING,
  python: VARIABLES,
  java: VARIABLES,
  csharp: VARIABLES,
  swift: VARIABLES,
  kotlin: VARIABLES,
  git: VARIABLES,
  database: DATA,
  api: SCIENCE,
  cloud: SCIENCE,
  docker: SCIENCE,
  design: CHANCE,
};

export const FALLBACK_ART = [VARIABLES, DATA, SCIENCE, CHANCE, THINKING];
