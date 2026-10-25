import type { Option, RungOption } from "../types";

export const motivationOptions: Option[] = [
  {
    value: "professional_developer",
    label: "I want to build a professional career",
    icon: "code",
  },
  {
    value: "advance_career",
    label: "To advance my current career",
    icon: "briefcase",
  },
  {
    value: "build_things",
    label: "To create useful work and real projects",
    icon: "blocks",
  },
  { value: "for_fun", label: "Just to have fun", icon: "sparkles" },
  {
    value: "different_reason",
    label: "I have a different reason",
    icon: "help",
  },
];

// `rung` is explicit so placement never has to infer an ordering across what
// are really three different axes (tooling, shipping, professional context).
export const experienceOptions: RungOption[] = [
  { value: "complete_beginner", label: "Complete beginner", rung: 1 },
  { value: "watched_tutorials", label: "I’ve watched tutorials", rung: 1 },
  {
    value: "tried_small_exercises",
    label: "I’ve tried small exercises",
    rung: 2,
  },
  {
    value: "built_small_projects",
    label: "I’ve built small projects",
    rung: 3,
  },
  {
    value: "pushed_to_platform",
    label:
      "I’ve shared work on GitHub, Figma, Power BI, YouTube, Vimeo or similar",
    rung: 3,
  },
  {
    value: "built_used_by_others",
    label: "I’ve built something people used",
    rung: 4,
  },
  {
    value: "worked_clients_teams",
    label: "I’ve worked with clients or teams",
    rung: 4,
  },
];

// General experience can come from any area. Frontend framework choice needs
// a separate signal because someone can have shipped work without JavaScript.
export const javascriptExperienceOptions: RungOption[] = [
  {
    value: "new_to_javascript",
    label: "I have not used JavaScript yet",
    rung: 1,
  },
  {
    value: "javascript_basics",
    label: "I know the JavaScript basics",
    rung: 2,
  },
  {
    value: "interactive_pages",
    label: "I have built interactive pages with JavaScript",
    rung: 3,
  },
];

export const projectInterestOptions: Option[] = [
  { value: "ai_tools", label: "AI tools" },
  { value: "fintech", label: "FinTech" },
  { value: "education", label: "Education" },
  { value: "healthcare", label: "Healthcare" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "productivity", label: "Productivity tools" },
  { value: "games", label: "Games" },
  { value: "social", label: "Social platforms" },
  { value: "dashboards", label: "Business dashboards" },
  { value: "school_project", label: "School / final-year projects" },
  { value: "video", label: "Video and film" },
  { value: "campaigns", label: "Campaigns" },
  { value: "brand_content", label: "Brand and content" },
  { value: "social_media", label: "Social media" },
];

export const immediateNeedOptions: Option[] = [
  {
    value: "career_path",
    label: "Find the right career path",
    icon: "compass",
  },
  { value: "choose_stack", label: "Learn a specific skill", icon: "target" },
  { value: "learn_basics", label: "Learn from scratch", icon: "sprout" },
  { value: "fix_gaps", label: "Fill gaps in what I know", icon: "puzzle" },
  { value: "build_projects", label: "Build stronger projects", icon: "pencil" },
  { value: "improve_portfolio", label: "Improve my portfolio", icon: "ribbon" },
  { value: "interview_prep", label: "Prepare for interviews", icon: "message" },
  { value: "something_specific", label: "Something specific", icon: "sparkle" },
];

export const dailyTimeOptions: Option[] = [
  { value: 5, label: "5 min", aside: "A coffee queue" },
  { value: 10, label: "10 min", aside: "A bus ride" },
  { value: 15, label: "15 min", aside: "A lunch break" },
  { value: 20, label: "20 min +", aside: "I’m serious" },
];
