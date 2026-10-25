import { FALLBACK_ART, STAGE_ART } from "../data/stage-art";

// Matches a stage's id against the tech it teaches, so its card can show
// matching art. Returns null when a stage (e.g. "DOM manipulation") doesn't
// map cleanly: better the fallback art than a wrong match.
function stageIcon(stageValue: string) {
  const tokens = stageValue.split("_");
  const has = (...keywords: string[]) => keywords.some((keyword) => tokens.includes(keyword));

  if (has("react")) return "react";
  if (has("vue")) return "vue";
  if (has("angular")) return "angular";
  if (has("typescript")) return "typescript";
  if (has("html", "css")) return "markup";
  if (has("js", "javascript")) return "js";
  if (has("python")) return "python";
  if (has("java")) return "java";
  if (has("csharp")) return "csharp";
  if (has("swift")) return "swift";
  if (has("kotlin")) return "kotlin";
  if (has("sql", "database", "databases")) return "database";
  if (has("docker", "containers")) return "docker";
  if (has("cloud")) return "cloud";
  if (has("git")) return "git";
  if (has("figma", "design")) return "design";
  if (has("api", "apis", "rest", "graphql", "networking")) return "api";
  return null;
}

export function getStageArt(stageValue: string, index: number) {
  const icon = stageIcon(stageValue);
  return (icon && STAGE_ART[icon]) || FALLBACK_ART[index % FALLBACK_ART.length];
}
