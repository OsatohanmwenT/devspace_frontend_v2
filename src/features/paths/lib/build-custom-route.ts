import type { CustomRoute } from "~/types/paths";

const NEW_TO_IT = "I’m completely new";

// A short, distinct title from a goal, so several custom paths don't all read
// the same on Home and Paths.
export function deriveCustomTitle(goal: string) {
  const cleaned = goal.trim().replace(/^i(?:'d| would)? (?:want|like) to\s+/i, "");
  const firstClause = cleaned.split(/[.,;]/)[0].trim();
  if (!firstClause) return "Your custom learning route";
  const capped = firstClause.charAt(0).toUpperCase() + firstClause.slice(1);
  return capped.length > 60 ? `${capped.slice(0, 57)}…` : capped;
}

const slug = (goal: string) =>
  goal.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "route";

const reactNativeProject = (outcome: string) =>
  ({
    "Prepare for interviews": "Explain and defend the state choices in a React Native app during technical interviews.",
    "Understand state deeply": "Build a state architecture you can explain, test, and evolve with confidence.",
    "Build a new app": "Create a polished mobile app with a reliable state foundation.",
  })[outcome] ?? "Refactor an existing React Native app into a clearer, more reliable state system.";

const genericProject = (outcome: string) =>
  ({
    "Prepare for interviews": "Turn your learning into clear examples and talking points for interviews.",
    "Understand it deeply": "Build a project that makes the concepts concrete and easy to revisit.",
    "Improve an existing project": "Apply the new skills directly to an existing project and make it stronger.",
  })[outcome] ?? "Build a focused project that proves the skill in a real context.";

// Pure, so it can be called with an explicit next answer at the moment one is
// given, before state has re-rendered. The route is scripted rather than
// generated; the backend will own this.
export function buildCustomRoute(goal: string, experience: string, outcome: string): CustomRoute {
  if (/react native|state management/i.test(goal)) {
    return {
      id: "custom-react-native-state",
      title: "React Native State Management",
      goal: "Master state management in React Native, from component state through server state and performance.",
      experience,
      outcome,
      startingPoint:
        experience === NEW_TO_IT
          ? "We’ll start with React Native fundamentals before state gets complex."
          : "You already have the basics, so we begin where state decisions become useful.",
      comfort: "How comfortable are you with React Native?",
      comfortOptions: [NEW_TO_IT, "I know React but not React Native", "I’ve built small React Native apps", "I use it but struggle with state"],
      outcomeQuestion: "What do you want to be able to do?",
      outcomeOptions: ["Build a new app", "Refactor an existing app", "Prepare for interviews", "Understand state deeply"],
      focus: ["component state", "shared state", "Context", "Zustand / Redux patterns", "server state", "performance"],
      skip: ["basic JavaScript", "beginner React fundamentals"],
      sections: ["Understanding State", "Sharing State", "Application State Patterns", "Server State", "Production State Architecture"],
      stages: [
        { label: "Start here", title: "Understand component state", description: "Make local state feel predictable before sharing it across your app." },
        { label: "Build confidence", title: "Share state with the right pattern", description: "Move through Context and state libraries without adding unnecessary complexity." },
        { label: "Ship it", title: "Handle server state and performance", description: "Keep real app data reliable, responsive, and ready for production." },
      ],
      project: reactNativeProject(outcome),
    };
  }

  return {
    id: `custom-${slug(goal)}`,
    title: deriveCustomTitle(goal),
    goal,
    experience,
    outcome,
    startingPoint:
      experience === NEW_TO_IT
        ? "We’ll begin with the practical foundations, then build momentum quickly."
        : "We’ll begin from the experience you already have and avoid repeated basics.",
    comfort: "How familiar are you with this topic?",
    comfortOptions: [NEW_TO_IT, "I know the basics", "I’ve built small projects", "I use it but want depth"],
    outcomeQuestion: "What do you want to be able to do?",
    outcomeOptions: ["Build a new project", "Improve an existing project", "Prepare for interviews", "Understand it deeply"],
    focus: ["core concepts", "practical patterns", "a guided project", "review and practice"],
    skip: ["unnecessary beginner material"],
    sections: ["Foundations", "Core patterns", "Build it", "Make it reliable"],
    stages: [
      { label: "Start here", title: "Build useful foundations", description: "Learn only the concepts you need to make progress on your goal." },
      { label: "Put it to work", title: "Practice the core patterns", description: "Use short exercises and examples that connect directly to your goal." },
      { label: "Make it real", title: "Build and refine a project", description: "Turn the learning into a result you can show, explain, or improve." },
    ],
    project: genericProject(outcome),
  };
}

// Typing is never a dead end: a reply that only loosely matches an option still
// picks it. Returns null when nothing is close.
export function matchOption(text: string, options: string[]) {
  const needle = text.trim().toLowerCase();
  if (!needle) return null;
  return (
    options.find((option) => {
      const hay = option.toLowerCase();
      if (hay.includes(needle) || needle.includes(hay)) return true;
      return hay.split(/\W+/).some((word) => word.length > 3 && needle.includes(word));
    }) ?? null
  );
}
