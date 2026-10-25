import type { Option } from "../types";

// Roles broad enough to cover several real tech stacks get one more question
// before experience/placement. The ladder in starting-points.ts has a
// `${role}_${stack}` entry for each option here.
export const stackOptions: Record<string, Option[]> = {
  frontend_developer: [
    { value: "help_me_choose", label: "Help me choose" },
    { value: "react", label: "React", icon: "react" },
    { value: "vue", label: "Vue", icon: "vue" },
    { value: "angular", label: "Angular", icon: "angular" },
  ],
  backend_developer: [
    { value: "help_me_choose", label: "Help me choose" },
    { value: "node", label: "Node.js", icon: "js" },
    { value: "python", label: "Python", icon: "python" },
    { value: "java", label: "Java", icon: "java" },
    { value: "csharp", label: "C#", icon: "csharp" },
  ],
};

export const STACK_ROLES = new Set(Object.keys(stackOptions));

// Mirrors roleSubQuiz's approach: ask about a preference someone can answer
// without knowing the tech yet, not "which stack sounds cooler".
export const stackSubQuiz: Record<
  string,
  { prompt: string; options: Option[] }
> = {
  frontend_developer: {
    prompt: "Which of these matters more to you right now?",
    options: [
      { value: "react", label: "The biggest ecosystem and job market" },
      { value: "vue", label: "A gentle learning curve with clear structure" },
      { value: "angular", label: "Built-in structure for larger teams" },
    ],
  },
  backend_developer: {
    prompt: "Which of these sounds most like you?",
    options: [
      { value: "node", label: "I’d rather use JavaScript everywhere" },
      { value: "python", label: "I want the simplest syntax to start with" },
      { value: "java", label: "I want skills common at large companies" },
      {
        value: "csharp",
        label: "I’m interested in the Microsoft / .NET world",
      },
    ],
  },
};
