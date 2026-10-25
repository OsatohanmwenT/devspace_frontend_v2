import type { Branch } from "../types";

export const BRANCHES = [
  { value: "web", label: "Websites & Interfaces", icon: "web" },
  { value: "mobile", label: "Apps for Phones", icon: "mobile" },
  { value: "backend", label: "Servers & Databases", icon: "backend" },
  { value: "data", label: "Data & Insights", icon: "data" },
  { value: "ai", label: "AI & Automation", icon: "ai" },
  { value: "product", label: "Product & Business", icon: "target" },
  { value: "marketing", label: "Marketing & Growth", icon: "marketing" },
  { value: "content_media", label: "Content & Media", icon: "media" },
  { value: "design", label: "Design & User Experience", icon: "design" },
  { value: "cloud", label: "Cloud, Security & Deployment", icon: "cloud" },
] as const satisfies readonly Branch[];
