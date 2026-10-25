# DevSpace v2: feature-based migration plan

## Summary

Use `../devspace-theme` (DevSpace Teams) as the reference and build in `devspace_frontend_v2`. Preserve the existing screens, behavior, content, and meaningful animations. Refactor the large components and `main.jsx` into page routes and feature folders. Use Tailwind CSS for styling. Keep Teams unchanged.

The first pass covers the core learner flow. Leagues, payouts, and Premium follow after it works end to end. V2 starts with a fresh browser save; it does not read Teams' `devspace-progress` data. This plan is separate from the existing `docs/refactor-plan.md` draft.

## Folders and files

```text
src/
├─ app/
│  ├─ layout.tsx, globals.css, page.tsx
│  ├─ onboarding/page.tsx
│  ├─ (app)/layout.tsx
│  │  ├─ home/page.tsx
│  │  ├─ paths/page.tsx
│  │  ├─ paths/[pathId]/page.tsx
│  │  ├─ paths/custom/page.tsx
│  │  ├─ practice/page.tsx
│  │  ├─ profile/page.tsx
│  │  └─ settings/page.tsx
│  └─ (focus)/
│     ├─ lesson/[lessonId]/page.tsx
│     └─ practice/[sessionId]/page.tsx
├─ features/
│  ├─ onboarding/{components,data,lib}
│  ├─ home/{components,lib}
│  ├─ paths/{components,data,lib}
│  ├─ lesson/{components,lib}
│  ├─ practice/{components,data,lib}
│  ├─ profile/{components,lib}
│  └─ settings/components
├─ components/
│  ├─ layout/                 AppShell, navigation, header, mobile navigation
│  ├─ devy/
│  │  ├─ DevyRive.tsx
│  │  └─ DevyLottie.tsx
│  └─ ui/                     Controls reused by multiple features
├─ progress/
│  ├─ progress-provider.tsx
│  ├─ progress-storage.ts
│  ├─ progress.ts
│  └─ progress.test.ts
public/assets/                   Copy assets as each page needs them
```

Route `page.tsx` files connect URLs to features. Feature logic, data, and components stay together. Add a shared component only after two features need it; split large Teams files by visible section or distinct behavior, without imposing a file-size rule. `globals.css` holds the Tailwind import and any Tailwind theme directives; page and component styling uses Tailwind utilities. Before adding ordinary CSS rules or a separate vanilla CSS file, inform the user and explain the specific need.

## Page phases

| Phase | Pages and main files | Completion target |
| --- | --- | --- |
| **0. Foundation** | Set up `components/devy/DevyRive.tsx` and `DevyLottie.tsx` first, using the existing Rive and Lottie runtimes and the descriptive clip filenames in `public/assets/animations/`. Then set up `app/layout.tsx`, Tailwind in `globals.css`, and the minimal `progress/*` files needed by onboarding. Add a UI control only when the first page uses it. | Rive and Lottie clips render with the same playback, ready callbacks, and reduced-motion behavior as Teams. V2 can save its own progress safely in a client component. Tailwind utilities reproduce Teams' current appearance. |
| **1. Onboarding** | `onboarding/page.tsx`; `features/onboarding/components/OnboardingFlow.tsx`, `OnboardingStep.tsx`, `GeneratingPath.tsx`, `FirstLessonWelcome.tsx`, `motion/*`; `data/onboarding.ts`; `lib/onboarding.ts` and tests. | All current questions, branches, placement rules, back/next behavior, reveal screens, and profile creation match Teams. Completion saves the profile and opens the first-lesson welcome. |
| **2. App shell and Home** | `(app)/layout.tsx`, `home/page.tsx`; `components/layout/AppShell.tsx`, `TopNav.tsx`, `MobileTabBar.tsx`, `HeaderUtilities.tsx`; `features/home/components/*` for the mission, path, practice, streak, and quick-action sections. | The existing Home layout and navigation work with saved onboarding data. Links to unfinished pages are introduced only as their routes are built. |
| **3. Paths** | `paths/page.tsx`, `paths/[pathId]/page.tsx`, `paths/custom/page.tsx`; `features/paths/components/PathsView.tsx`, `LearningPathDetail.tsx`, `LessonRow.tsx`, `CustomPathBuilder.tsx`, `GuidebookView.tsx`; `data/paths.ts`, `guidebook-entries.ts`; path logic and tests. | Explore, current path, path detail, custom builder, and guidebook preserve Teams' behavior. Selecting a path and region shows the corresponding lessons. |
| **4. Lessons** | `lesson/[lessonId]/page.tsx`; `features/lesson/components/LessonView.tsx`, article, question, quiz, code editor, narration, assistant, and completion components; `lib/lesson-content.ts`, `lesson-flow.ts`, `question-state.ts`, `code-exercise.ts` and tests. | Each URL opens its actual lesson content. Answers, code exercises, navigation, notes, media, and completion work; completion updates saved progress. This route uses the focused layout. |
| **5. Practice** | `practice/page.tsx`, `practice/[sessionId]/page.tsx`; `features/practice/components/PracticeView.tsx`, `PracticeSession.tsx`, `PracticeResult.tsx`; `data/practice.ts`; warm-up and checking logic with tests. | Catalogue sessions, warm-up, results, and the warm-up-to-lesson transition match Teams. Completion updates the same progress record. |
| **6. Profile and Settings** | `profile/page.tsx`, `settings/page.tsx`; `features/profile/components/ProfileView.tsx`, `EditProfileModal.tsx`, `BadgesDrawer.tsx`; profile logic and tests; `features/settings/components/SettingsView.tsx` and its existing sections. | Profile editing, badges, daily goal, theme controls, and reachable settings work against v2 data. |
| **7. Core-flow verification** | Review the migrated routes and shared files. | Walk through onboarding → Home → Paths → Lesson → Practice → Profile/Settings on desktop and mobile; fix parity, keyboard, and responsive issues. |

Carry over the pure Teams logic and its existing tests when the owning feature is migrated. Port only the XP, streak, and reward calculations needed by the core pages into `progress/`; keep their observed behavior. Defer the full Leaderboard, private leagues, head-to-head, payouts, and Plans screens to a later set of page phases.

## Interfaces and checks

- `progress-provider.tsx` exposes the saved profile, path choice, lesson and practice completions, and the actions that change them. `progress-storage.ts` uses a new v2 localStorage key. Browser storage is accessed from client components.
- Keep Rive and Lottie in separate, clearly named components. Preserve the clip-to-file mapping and the behavior each caller relies on. Copy only clips required by the current phase, keeping their descriptive asset names. In production, measure animation transfer and startup time; use a CDN asset origin if it improves delivery, without changing clip IDs or adding an asset URL abstraction before it is needed.
- Preserve existing path, lesson, and practice IDs so links and progress records refer to the same content. Dynamic route pages resolve those IDs and show a useful missing-content state for an unknown ID.
- At the end of each phase, run the migrated logic tests, `pnpm lint`, and `pnpm build`, then compare the page and its interactions with Teams in the browser. The core-flow walkthrough is the final acceptance check.

## Assumptions

- "Same as Teams" governs this migration, including its current visual design. The newer light-first design document is a separate redesign pass.
- The Teams codebase remains an unchanged reference.
- V2 uses a new browser storage key; existing Teams saves stay untouched.
- Tailwind CSS is the styling default throughout. Any need for vanilla CSS is raised with the user before it is added.
- Foundation code stays limited to what onboarding and its animations require; later pages add their own dependencies when reached.
