# DevSpace v2 — Refactor Plan

Source of truth for the migration from the ideation codebase (`../devspace-theme`, Vite + JSX, no router) into this Next.js 16 / TypeScript / Tailwind 4 project, organised by feature.

> Status: **Phases 0–3 built.** Next: Phase 4 (Lesson).
> Decided so far: Tailwind only · no unneeded code · Rive + Lottie from a CDN (Tigris, wired later; local `public/` until then) · `dark:` variants · typed mock data behind an API layer (backend to come).

---

## 0. Working rules (set by you — apply to every phase)

1. **Tailwind CSS only.** All styling is Tailwind utilities. Vanilla CSS is never written without asking you first, with the exact snippet and the reason. The old `styles.css` (3,948 lines) and `cardConcept.css` are not ported; their intent is re-expressed in utilities.
2. **No unneeded code.** A file, prop, dependency, asset or helper is added in the phase that first uses it — not in advance. No placeholder files, no empty folders, no "might need later" variants, no duplicated helpers (the old code defined `usePrefersReducedMotion` twice). Dead and unreferenced old code is not ported.
3. **Neat, predictable file names.** `kebab-case.ts(x)`, one responsibility per file, name says what it is (`devy-rive.tsx`, `devy-lottie.tsx`, `devy-clips.ts`).
4. **Heavy animation assets are served from a CDN in production** (see Phase 0). CDN is **Tigris**; wiring it is deferred. Until then assets come from `public/` through the same `assetUrl()` helper.
5. **Mock data first, backend later.** The app talks to a typed API layer from day one. Today those functions are backed by mock data; when the backend exists only the function bodies change, never the components (see §3a).
6. **Dark mode with Tailwind `dark:` variants**, written as each component is built (not retrofitted in a final pass).

### Tailwind configuration (not vanilla CSS)

Tailwind 4 is configured in CSS. These directives live in the single `src/app/globals.css` and count as Tailwind, not vanilla CSS: `@import "tailwindcss"`, `@theme` (tokens, fonts, keyframes), `@custom-variant`, `@utility`.

**Dark mode (decided):** `dark:` utilities only. Because the old app had a user theme toggle, the `dark` variant is switched by a class on `<html>` via one line, `@custom-variant dark (&:where(.dark, .dark *));`, plus a tiny `ThemeProvider` that sets the class (and avoids a flash on load). No plain-CSS dark token block, no `[data-theme=light]_&` overrides. If you would rather follow only the OS setting, we delete that line and the toggle — say so.

No vanilla CSS is planned anywhere. If one case turns up I stop and ask first.

---

## 1. What we are migrating from

| Fact | Detail |
| --- | --- |
| Stack | Vite, React, plain JSX, Tailwind 4 + a 3,948-line `styles.css` |
| Routing | None. `main.jsx` (1,411 lines) holds ~25 `useState`s and switches screens with `active === 'Paths'` etc. |
| State | One `progress` object persisted to `localStorage` (`devspace-progress`), mutated by pure functions in `data/progress.js` |
| Tests | 40 `*.test.js` files (`node --test`) next to pure logic. These are the most valuable asset to carry over. |
| Biggest files | `home/index.jsx` 94 KB · `main.jsx` 76 KB · `onboarding/index.jsx` 57 KB · `LeagueDashboard` 52 KB · `profile/index.jsx` 49 KB · `data/paths.js` 46 KB · `LessonView` 40 KB · `PrivateLeagues` 37 KB |
| Known debt (from its own docs) | dead `AppSidebar` and `PathRoadmap`; `currentPath.cards` and `detailLevels` disconnected in `paths.js`; overlapping Devy components; arbitrary hex colours inline instead of tokens; dark-first CSS with `[data-theme=light]_&` overrides |

Screens that exist today: Onboarding, Home, Paths (+ detail, custom builder, roadmap, guidebook), Lesson, Practice (+ warm-up, session), Leaderboard (leagues, private leagues, head-to-head, class space, payouts), Profile (+ edit, badges), Settings, Plans.
Not built: Build, Assessments, Resources, Notifications, Landing page.

## 2. What we are migrating to

Already in v2: Next 16.4, React 19.3, Tailwind 4, TypeScript strict, `~/*` → `src/*`, `cacheComponents: true`, `reactCompiler: true`, App Router.

Consequences worth planning around:

- **React Compiler is on** → do not carry over `useMemo`/`useCallback` habits from `main.jsx`. Write plain code.
- **`cacheComponents` is on** → request-time and user-specific data must be handled deliberately (Suspense / client components). Route `page.tsx` files stay as thin server shells. Data-fetching approach is decision 10 in §7.
- The Next docs in `node_modules/next/dist/docs/` are the reference (per `AGENTS.md`), not memory.
- Design direction (`devspace-theme/docs/devspace-product-design-direction.md`) wins over old code: light-first, flat surfaces, `#19079B` brand, top nav (Home / Paths / Practice / Build), no gradients on cards.

---

## 3. Target folder structure

```
src/
├─ app/                                   ROUTING ONLY — thin page.tsx files
│  ├─ layout.tsx                          fonts, providers, theme bootstrap
│  ├─ globals.css                         the ONLY stylesheet: `@import "tailwindcss"` + `@theme` tokens
│  ├─ not-found.tsx · error.tsx
│  ├─ page.tsx                            gate: no profile → /onboarding, else → /home
│  │
│  ├─ (onboarding)/onboarding/page.tsx
│  │
│  ├─ (app)/                              layout = AppShell (top nav, header utilities)
│  │  ├─ layout.tsx
│  │  ├─ home/page.tsx
│  │  ├─ paths/page.tsx
│  │  ├─ paths/[pathId]/page.tsx
│  │  ├─ paths/custom/page.tsx
│  │  ├─ practice/page.tsx
│  │  ├─ leaderboard/page.tsx             + /private, /head-to-head, /class
│  │  ├─ payouts/page.tsx
│  │  ├─ profile/page.tsx
│  │  └─ settings/page.tsx
│  │
│  └─ (focus)/                            layout = chrome-less, full-screen
│     ├─ layout.tsx
│     ├─ lesson/[lessonId]/page.tsx
│     ├─ practice/[sessionId]/page.tsx
│     └─ plans/page.tsx
│
├─ features/                              ONE FOLDER PER PRODUCT AREA
│  └─ <feature>/
│     ├─ components/                      UI used only by this feature
│     ├─ api/                             typed calls to the backend (mock-backed today)
│     ├─ hooks/
│     ├─ lib/                             pure UI/derivation logic (+ colocated *.test.ts)
│     ├─ data/                            static CONTENT shipped with the app (copy, option lists)
│     ├─ types.ts
│     └─ index.ts                         the ONLY public surface of the feature
│
├─ components/
│  ├─ ui/                                 primitives with no product knowledge
│  ├─ devy/                               the single consolidated Devy system
│  └─ layout/                             AppShell, TopNav, HeaderUtilities, MobileTabBar, PageWipe
│
├─ lib/                                   shared pure utils (rng, ordinal, week, season, confetti)
├─ providers/                             ThemeProvider (+ data-fetching provider, once chosen)
├─ mocks/                                 the MOCK BACKEND — deleted when the real one lands (see §3a)
├─ types/                                 cross-feature types (Progress, Profile, Path, Lesson)
└─ config/                                nav items, routes map, feature flags
```

### Features

```
features/
├─ onboarding/    welcome, questions, breaks, role reveal, placement, generating path, first-lesson welcome
├─ home/          mission, practice card, streak card, leaderboard card, quick actions, Devy prompt, carousel
├─ paths/         explore, current path, detail/roadmap, custom builder, guidebook, cheatsheet, roadmap transition
├─ lesson/        view, article, question, quiz, code editor, practice, data table, narration, complete sequence, Devy assistant
├─ practice/      intro, warm-up, session, result, topic icons
├─ progress/      xp, coins, daily quests, rewards, entitlements — API calls + display helpers only (game logic is the mock backend)
├─ streak/        streak engine UI: journey modal, milestone trophy/transition
├─ leaderboard/   leagues, ladder, rows, tabs, private leagues, head-to-head, class space, payouts, celebration, result banner
├─ profile/       profile page, edit modal, badges, avatar styles, profile theme
├─ settings/      settings page, rows, sections
└─ plans/         plan cards, toggle, perks, premium state
```

### Import rules (enforced by ESLint `no-restricted-imports`)

1. `app/*` may import from `features/*` (via `index.ts`), `components/*`, `providers/*`.
2. `features/A` may **not** import from `features/B` internals. Cross-feature needs go through `B/index.ts`, or the code moves down to `components/`, `lib/`, or `types/`.
3. `components/ui` imports nothing from `features/`.
4. `lib/` and `types/` import nothing from React-land features.
5. Business logic (`lib/`, `data/`) has no JSX and is covered by tests before its UI is ported.

### Conventions

- Components `PascalCase.tsx`; everything else `kebab-case.ts` (rename from camelCase on the way in, e.g. `leagueSim.js` → `league-sim.ts`).
- `"use client"` only where state/effects/browser APIs require it; `page.tsx` stays a server component.
- Tailwind utilities only (rule 1). No arbitrary hex in components: colours come from `@theme` tokens (`bg-surface`, `text-muted`, `border-subtle`). The `[#1f1f1f]` / `[[data-theme=light]_&]:…` pattern is not ported.
- One component per file; target < 250 lines. The 50–95 KB files get split by section during their phase.
- Tests: Vitest, colocated `*.test.ts`, ported from the existing `node --test` suites.

## 3a. Data layer and mock data

The backend is coming, so the app is built as a client of an API, not as a self-contained `localStorage` app. The old app mixed three kinds of data in one place; they separate like this:

| Kind | Examples (old files) | In v2 |
| --- | --- | --- |
| **App content** | onboarding option lists, copy, guidebook entries | `features/*/data/` — ships with the app |
| **Server data** | profile, progress, XP, coins, streak, completed lessons, paths, lesson content, practice sessions | `features/*/api/` calls → mock data now |
| **Server logic** | streak decay, XP/coin awards, quest progress, rewards, league standings (`leagueSim`), rivals, head-to-head, private leagues, league chat | the **mock backend** in `mocks/` — a backend will own this, so it is not written as app logic |

Shape:

```
types/                          API contracts (Profile, Progress, Path, Lesson …), written from the old data shapes
features/<f>/api/<f>-api.ts     async functions returning typed promises: getProfile(), saveProfile(), completeLesson(id) …
mocks/mock-db.ts                localStorage-backed store so a reload keeps the mock user
mocks/<domain>/                 fixtures + the old pure game logic (with its tests), acting as the fake server
```

Rules for this layer:

1. Components and hooks only call `features/*/api`. They never import from `mocks/` or touch `localStorage`.
2. When the backend arrives, only the bodies of the `api` functions change (mock-db call → `fetch`) and `mocks/` is deleted. No mock/real toggle is built now (rule 2).
3. Every API function is async from day one, so every screen is built with **loading, error and empty states**. The old app resolved instantly from `localStorage` and had none.
4. Contracts live in `types/` and are the thing to agree with the backend. If an OpenAPI spec exists, those types get generated from it instead of hand-written.
5. Client-side derivation that is only presentation (e.g. "which region is current") stays in the feature's `lib/`. Anything that decides a *result* (XP awarded, streak kept, rank) belongs to the backend.

Effect on the old files: `data/progress.js`, `lib/streak.js`, `coins.js`, `rewards.js`, `dailyQuests.js`, `leagueSim.js`, `rivals.js`, `h2h.js`, `privateLeagues.js`, `leagueChat.js`, `leagueInsights.js` move to `mocks/` with their tests rather than into feature `lib/`. `lib/pathProgress.js` is decided in Phase 3 once we know whether the API returns progress already derived.

---

## 4. Phases

Every phase ends with the same **definition of done**: route works in `pnpm dev`, `pnpm build` and `pnpm lint` pass, ported tests green, visually checked against the old screen in the browser, nothing in `devspace-theme` modified.

### Phase 0 — Foundation (no visible screens)

Lean on purpose (rule 2): only what every later phase shares. UI primitives (button, drawer, icons, badge…), the mock game logic (streak, coins, quests, leagues), and Devy's secondary surfaces are **not** built here — each lands in the phase that first uses it.

| Task | Files created |
| --- | --- |
| Tooling | `vitest.config.ts`; ESLint import boundaries (no deep `features/*/*` imports; only `features/*/api` may import `mocks/`; shared code may not import features); `pnpm test` |
| Tokens (Tailwind only) | `app/globals.css`: `@import "tailwindcss"`, `@custom-variant dark`, `@theme` (brand `#19079B`, teal / amber / lilac / green / red semantics, radii, fonts). Fix the Arial body font so the already-loaded Geist variables are used. Components use `dark:` utilities from the start. |
| Animation runtime + Devy | See breakdown below |
| Contracts | `types/profile.ts`, `types/progress.ts` — only the fields Phase 1 reads/writes. Path and lesson contracts arrive with Phases 3–4. |
| Mock backend | `mocks/mock-db.ts` (localStorage-backed), `mocks/profile/` fixture + save logic |
| API | `features/profile/api/profile-api.ts`: `getProfile()`, `saveProfile()` (needed by the onboarding gate) |
| Theme | `lib/theme.ts` (storage key + `<head>` init script, no flash), `hooks/use-theme.ts`, `providers/theme-provider.tsx` (re-applies the class on dev Strict Mode remount). The data-fetching provider is added once the approach is chosen (§7). |

**Exit (met):** a throwaway page played one Rive clip and one Lottie clip through `assetUrl()`; `getProfile()` / `saveProfile()` round-trip through the mock backend and survive a reload; the dark toggle works; tests green.

#### Animation runtime + Devy (Rive and Lottie) — built

```
config/assets.ts                       assetUrl(): local /assets/… now, CDN when NEXT_PUBLIC_ASSET_CDN is set
hooks/use-prefers-reduced-motion.ts    one copy (the old code had two identical ones)
components/devy/
├─ rive/    rive-clips.ts · devy-rive.tsx
├─ lottie/  lottie-clips.ts · devy-lottie.tsx
├─ devy-mood.tsx                       static SVG moods: neutral / celebrating / annoyed / walking
└─ index.ts                            `next/dynamic` (ssr: false) wrappers for the two players
public/assets/animations/rive/ · public/assets/animations/lottie/ · public/assets/devy/
```

- **Grouped by runtime.** Rive and Lottie each own a folder with their clip registry next to their player, in code and in `public/`.
- **Clip registry per runtime.** Screens ask for `<DevyRive clip="launchpad-intro" />` or `<DevyLottie clip="wave" />`, never a path. Rive clips are typed as `state-machine` or `timeline`.
- **Moods animate with Tailwind.** The old `.devy-celebrate / -annoyed / -walk` CSS became `--animate-devy-*` + `@keyframes` inside `@theme`, used as `motion-safe:animate-devy-celebrate`. Zero vanilla CSS.
- **Rive package:** only `@rive-app/react-webgl2`.
- **WASM:** both libraries already load their WASM from jsDelivr, pinned to the installed version, so `lib/animation-runtime.ts` is **not built yet** (rule 2). It is added when Tigris is wired, calling `RuntimeLoader.setWasmUrl` and dotLottie's `setWasmUrl`.
- **Known debt:** the three Rive `timeline` clips (`rope-into`, `side-pop-out-intro`, `up-down-pop-out`) use `animations`, `scrub()` and `play(name)`, which Rive has deprecated. They work in 4.36 and log console warnings. Re-exporting them with a state machine fixes it; not scheduled.

Why a CDN matters here (measured from `devspace-theme/public/assets/animations`):

| Asset | Size |
| --- | --- |
| 8 Lottie files in use (coin, idle, walk-loop, lesson-complete, listening, thinking, wave, side-pop-out) | **1.9 – 6.4 MB each, ~33 MB total** |
| 5 Rive clips actually used | 22 – 55 KB each |
| Rive WASM / dotLottie WASM | ~2.2 MB / ~1.2 MB |

What is **not** carried over (rule 2): `devy-idle-state.riv`, `devy-jump.riv`, `devy-rig-basic.riv`, `devy-walk.riv` and `devy-walk.lottie` — never referenced by any code. `devy-coin.lottie` (6.4 MB) is also dropped: the old code's own comment says all 72 frames are identical, so it is a static image; the 5 KB `icons/gold-coin.webp` already covers it. `DevyCorner`, `DevyPanel`, `DevySpeechBubble`, `DevyChatRail`, `DevyAssistant` wait for the lesson/home phases that need them, rebuilt on the players above.

Worth knowing for later (not scheduled): per the old code's comments, `devy-idle-loop.lottie` (6 MB) is a frame-by-frame *capture* of the Rive rig with an opaque dark background, which is why it is large and cannot sit on a light surface. Re-exporting it as a native Rive clip would fix both. I would only do this if you want it.

### Phase 1 — Onboarding  `/onboarding`  — built

Old: `components/onboarding/*` (57 KB `index.jsx` + `OnboardingStep` 27 KB + 5 more), `data/onboarding.js` 31 KB, `lib/onboarding.js`.

```
app/page.tsx                              → <EntryRedirect /> (no profile → /onboarding, else /home)
app/(onboarding)/onboarding/page.tsx      → <Onboarding />
app/(app)/home/page.tsx                   TEMPORARY landing, replaced in Phase 2
components/ui/button.tsx                  primary CTA (brand face, darker lower edge)
features/profile/components/entry-redirect.tsx
features/onboarding/
├─ index.ts                               `next/dynamic` (ssr: false) → Onboarding
├─ types.ts
├─ components/
│  ├─ onboarding.tsx                      container: saveProfile() then router.replace("/home")
│  ├─ onboarding-flow.tsx                 renders the current screen, header and footer
│  ├─ onboarding-header.tsx · step-frame.tsx
│  ├─ welcome-screen.tsx · generating-path.tsx
│  ├─ question-screen.tsx · step-heading.tsx · option-list.tsx · option-icon.tsx · chip-list.tsx
│  ├─ break-screen.tsx · branch-orbit.tsx
│  ├─ role-reveal.tsx · stage-cards.tsx · word-reveal.tsx
│  ├─ placement-recommendation.tsx
│  └─ route-review.tsx · route-options.tsx · route-assessment.tsx · assessment-result.tsx
├─ hooks/  use-onboarding-flow · use-build-in · use-select-pop · use-typewriter · use-count-up · use-scroll-hint · use-delayed-value
├─ lib/    resolve · steps · break-content · placement-copy · stage-groups · stage-art · build-profile · role-label · option-surface · motion-presets · onboarding.test
└─ data/   branches · roles · starting-points · sub-quizzes · stacks · questions · feedback · outcomes · step-copy · stage-art · assessment-questions · branch-orbit-cards · icon-paths
```

Decisions taken while building (flag any you disagree with):

- **`motion` only.** `gsap` is not installed. The old `useBuildIn` became a ~50-line `animate()` hook; word reveal, orbit fan and count-up are plain `motion`.
- **Design direction applied, not copied.** Flat bordered surfaces instead of the old layered gradient cards; brand `#19079B` instead of `#2563eb`; a lighter `brand-bright` / `lilac` for dark surfaces. Added tokens: `brand-edge`, `brand-bright`, `lilac`, display font Rethink Sans.
- **Not ported (rule 2):** `PathCard`, `TeaserCards`, `CardFan` (parked or unused in the old app), `MiniIcon`, 9 unused icon paths, the CTA sheen and progress-bar edge flash, `branchTint`.
- **Deferred to the phase whose destination exists:** the first-lesson welcome (needs path + lesson data, Phase 3/4) and the page-wipe transition (Phase 2 shell). Finishing onboarding goes straight to `/home`.
- **Footer row is always reserved** so the content never jumps when the button appears or disappears; the old code re-laid out the frame after each exit.
- **`isFrameworkCheckpointReady`** and `computeDailyGoal` stay for Phase 2+, where Home reads them.
- **Logic is tested:** the old 28 onboarding tests are ported (31 total pass).

### Phase 2 — App shell + Home  `/home`

Old: `main.jsx` chrome section (lines ~1010–1370), `components/layout/*`, `components/home/*` (94 KB `index.jsx`), `header/XpPopover`.

```
components/layout/ app-shell.tsx · top-nav.tsx · header-utilities.tsx · profile-menu.tsx · mobile-tab-bar.tsx
config/nav.ts
features/home/
├─ components/
│  ├─ home-view.tsx                    composition only
│  ├─ mission-card.tsx
│  ├─ career-path-card.tsx
│  ├─ practice-card.tsx
│  ├─ streak-card.tsx
│  ├─ leaderboard-card.tsx
│  ├─ short-session-row.tsx
│  ├─ quick-actions.tsx
│  ├─ devy-spotlight-hero.tsx · devy-prompt-band.tsx · devy-compose-stage.tsx
│  └─ card-carousel/ (use-card-carousel.ts)
├─ lib/ derive-home-state.ts           (the ~150 lines of derived values in main.jsx: nextLesson, homeHint, dynamicUpdate, otherPaths…)
└─ index.ts
features/streak/components/ xp-popover.tsx          (header chip popovers; journey modal comes in Phase 6)
```
Decisions applied here: top nav (not sidebar) per the design doc; delete `AppSidebar`; leaderboard lives in header/profile menu until promoted.
Stubbed in this phase: links to Paths / Practice / Lesson render placeholder pages so nav is real from day one.

**Built (what actually shipped; supersedes the sketch above).** Matches DevSpace Teams at mobile (≤680), tablet (681–1200) and desktop (≥1201), dark and light. Verified in the browser pane plus `tsc`, `eslint` and the unit tests.

```
app/(app)/layout.tsx · home/page.tsx      <AppShell> · <HomeView />
features/shell/components/app-shell.tsx    loads profile + progress, redirects to /onboarding when none
components/layout/                         site-header · primary-nav · nav-items · header-stats · xp-popover · account-menu · animated-stat-icons
components/ui/                             icons · game-icon · tier-medal
hooks/                                     use-breakpoint · use-load · use-dismiss · use-viewport-width
providers/toast-provider.tsx
types/                                     home.ts · progress.ts
mocks/                                     home.ts · progress.ts · leagues.ts · mock-db.ts · paths/*
features/home/api/home-api.ts              getHome()           (backend swap point)
features/progress/api/progress-api.ts      getProgressSummary()
features/home/
├─ components/ home-view · home-desktop · home-carousel · carousel-card · continue-face · leaderboard-face · portfolio-face · update-face · scene-pager · card-cta · icon-chip · badge-coins · league-panel · dashboard-card · course-card · portfolio-card · daily-quests · prompt-bar · compose-stage
├─ hooks/      use-home-actions · use-card-carousel · use-devy-chat
└─ lib/        accents · greeting · carousel-layout · compose-suggestions · answer-prompt · orbit
```

- **Breakpoints** are Tailwind tokens (`tab:` 681px, `desk:` 1201px, plus `max-tab:` / `max-desk:`), mirrored by `useBreakpoint()`.
- **Desktop** is a grid (greeting, dashboard, course, portfolio, prompt bar). **Tablet/phone** is a 3D card carousel driven by one `position` motion value; reduced motion flattens the depth.
- **Compose stage:** focusing "Ask Devy" pushes the cards aside, Devy waves and suggestion cards orbit; asking switches to a chat thread (mock replies from `answer-prompt.ts` after 700 ms).
- **Teams tablet bug not copied:** at ~800×600 Teams' first card sits off-centre and the prompt bar overlaps the CTA. v2 uses the intended centred layout.
- **Deferred:** multi-course deck and switcher, warm-up face, streak journey modal (Phase 6), Devy button/drawer on other pages, desktop Premium popup (not ported).
- **Nav links to Paths / Leaderboard / Practice 404** until those phases add their routes.
- `build` was not run this phase because the dev server shares `.next`.

### Phase 3 — Paths  `/paths`, `/paths/[pathId]`, `/paths/custom`

> **Status: built** (`/paths`, `/paths/[pathId]`, `/paths/custom`). Detail page ported to match Teams: sticky region headers with a cover, lesson pedestals and the Rive/spotlight current tile, a lesson bar with a sweeping rim (motion-driven, no vanilla CSS), cheatsheet drawer and guidebook sheet, framework checkpoint. Overview: shared progress card for the active and paused custom paths, explore cards with Teams' light/dark surfaces. Custom path is a chat flow (`hooks/use-custom-path-chat.ts`) in a header-less `(focus)` route group, with the one-time intro (`components/ui/page-intro-stages.tsx`). Not ported: `RoadmapTransition` and the lesson podcast (both need lesson completion, Phase 4/5), and the read-only custom route view (unreachable in Teams).

Old: `components/paths/*`, `data/paths.js` (46 KB), `data/guidebookEntries.js`, `data/learningResources.js`, `RoadmapTransition`.

```
features/paths/
├─ components/
│  ├─ paths-view.tsx · explore-path-card.tsx · current-path-card.tsx · custom-path-card.tsx
│  ├─ path-detail/ learning-path-detail.tsx · region-section.tsx · lesson-row.tsx
│  ├─ custom-builder/ custom-path-builder.tsx (31 KB → split by step) · custom-path-introduction.tsx
│  ├─ guidebook/ guidebook-view.tsx · cheatsheet-drawer.tsx · reference-icons.tsx
│  └─ roadmap-transition.tsx
├─ api/ paths-api.ts                                   (paths, regions, lessons, progress — mock-backed)
├─ data/ guidebook-entries.ts  ·  learning-resources.ts   (app content)
(the 46 KB `data/paths.js` becomes fixtures in `mocks/paths/`, one file per career path)
├─ lib/ get-path.ts · build-custom-path-record.ts · tests
└─ types.ts
```
**Fix on the way in:** a single model `Path → Region → Lesson` (replaces the disconnected `currentPath.cards` vs `detailLevels`). Lessons are owned by regions, so selecting a region determines the tiles. Delete `PathRoadmap`.

### Phase 4 — Lesson  `/lesson/[lessonId]` (largest phase, three sub-phases)

Old: `components/lesson/*` (22 components + 12 logic files, ~280 KB).

**4a — Content engine (headless, tested)**
`features/lesson/api/lesson-api.ts` (lesson content + completion, mock-backed; content fixtures in `mocks/lessons/` from `lesson-content.ts` and `non-coding-lessons.ts`). `features/lesson/lib/`: `lesson-flow.ts`, `question-state.ts`, `code-exercise.ts`, `python-highlight.ts`, `sql-highlight.ts`, `mini-python.ts` (from `lib/miniPython.js`), `practice-check.ts` + all tests.
Fix: `getLesson(lessonId)` actually returns content for that id (old UI hardcoded it).

**4b — Lesson shell and interaction**
```
features/lesson/components/
├─ lesson-view.tsx (40 KB → shell + steps)      lesson-loading.tsx · lesson-progress-strip.tsx · lesson-navigation-pill.tsx
├─ article/ lesson-article.tsx · rich-text.tsx · command-chip.tsx · lesson-data-table.tsx
├─ question/ lesson-question.tsx · lesson-quiz.tsx
├─ code/ lesson-code-editor.tsx (32 KB → editor, output panel, test runner) · lesson-practice.tsx
├─ media/ youtube-segment-player.tsx · lesson-podcast-modal.tsx · narration-control.tsx · use-lesson-narration.ts
├─ notes-drawer.tsx
└─ devy-assistant.tsx                              built on components/devy
```
**4c — Completion**: `concept-transition.tsx`, `lesson-complete-sequence.tsx`, wiring `recordLessonCompletion` (XP, coins, streak, quests, league celebration triggers) into `progress` store actions.
Route is in `(focus)` — no top nav.

### Phase 5 — Practice  `/practice`, `/practice/[sessionId]`

Old: `components/practice/*`, `data/practice.js`, `lib/warmUp.js`, `lib/practiceUnits.js`, `lib/practiceCheck.js`.
```
features/practice/
├─ components/ practice-view.tsx · practice-card.tsx · practice-intro.tsx · warm-up-intro.tsx · practice-session.tsx · practice-result.tsx · topic-icon.tsx
├─ lib/ warm-up.ts · practice-units.ts · practice-check.ts · tests
├─ data/ practice.ts
└─ index.ts
```

### Phase 6 — Streaks, XP and rewards UI (cross-cutting)

The mock streak/xp logic and its tests are ported to `mocks/` at the start of this phase; the rest adds the surfaces.
```
features/streak/components/ streak-journey-modal.tsx (14 KB → split) · milestone-trophy.tsx · streak-milestone-transition.tsx
components/ui/ daily-quest-progress.tsx · animated-icons.tsx
features/profile/lib/badges.ts (+ test)
```
Open product question carried over from `observation.md`: should a streak day require *learning evidence* rather than any activity? Decide before building this phase (§7).

### Phase 7 — Profile  `/profile`

Old: `profile/index.jsx` (49 KB), `EditProfileModal` (31 KB), `BadgesDrawer`, `BadgeCoin`, `profileTheme`, `lib/profile.js`, `lib/avatarStyles.js`.
```
features/profile/
├─ components/ profile-view.tsx · profile-header.tsx · stats-grid.tsx · contact-links.tsx · public-profile-view.tsx
│              edit-profile/ edit-profile-modal.tsx · avatar-picker.tsx · links-editor.tsx · photo-upload.tsx
│              badges-drawer.tsx · badge-coin.tsx
├─ lib/ profile.ts · avatar-styles.ts · badges.ts · tests
└─ index.ts
```

### Phase 8 — Leaderboard and leagues  `/leaderboard/*`, `/payouts`

> **Status: official board built (8a + 8b partial).** The league simulation is ported to `mocks/leaderboard/` (cohorts, rival coins by day, ranks and daily movement, rival profiles) with league config in `config/leagues.ts`; `features/leaderboard` has the header, ladder, sliding-pill tabs, rows with generated DiceBear avatars, promotion/demotion dividers, hidden-row gaps, locked skeleton and competitor drawer. The board re-fetches every minute so rivals move. **Still the earlier simplified versions:** head-to-head and private leagues (`side-views.tsx`, one-line components to be split and ported in 8c/8d), share card, season result banner and celebration, payouts. Pro gating (all-time tab, full cohort) shows a "coming soon" toast until Plans (Phase 9). Home's league card still uses `mocks/leagues.ts`, so its ranks differ from this board until it is pointed at the same simulation.

Old: `components/leaderboard/*` (~200 KB) + `data/leagues.js`, `data/rivals.js`, `lib/leagueSim.js`, `leagueInsights.js`, `leagueChat.js`, `leagueAccess.js`, `h2h.js`, `privateLeagues.js`, `rivalProfile.js`, `shareCards.js`.
```
features/leaderboard/
├─ components/
│  ├─ leaderboard-view.tsx · leaderboard-tabs.tsx · leaderboard-row.tsx · league-ladder.tsx · tier-medal.tsx · season-deadline.tsx · locked-leaderboard.tsx
│  ├─ league-dashboard/ (52 KB → header, standings, insights, chat, promotion banner)
│  ├─ private-leagues/ (37 KB → list, create, join, organizer dashboard)
│  ├─ head-to-head/ · class-space/ · competitor-drawer.tsx
│  ├─ league-result-banner.tsx · league-qualified-celebration.tsx · share-card-modal.tsx
│  └─ payouts/ payout-center.tsx
├─ api/ leaderboard-api.ts · private-leagues-api.ts · head-to-head-api.ts · payouts-api.ts      (typed, mock-backed)
├─ lib/ share-cards.ts · tests                                                                    (presentation only)
(league-sim, rivals, h2h, chat, private-leagues, league-insights, league-access → `mocks/leaderboard/`)
└─ index.ts
```
Sub-phases: **8a** mock league backend (`mocks/leaderboard/`: league sim, rivals, h2h, chat, private leagues, with their tests) + `api/`, **8b** public league (dashboard, ladder, standings), **8c** private leagues, **8d** head-to-head + class space, **8e** payouts. Design doc says streak/XP/league are placeholder until a real accrual model exists — this phase should ship behind a feature flag and not imply a working league until then.

### Phase 9 — Settings and Plans  `/settings`, `/plans`

Old: `settings/*`, `plans/*`, `data/plans.js`, `lib/entitlements.js`.
```
features/settings/ components/ settings-view.tsx · settings-section.tsx · settings-row.tsx
features/plans/    components/ plans-view.tsx · plan-card.tsx · plan-type-toggle.tsx · perk-list.tsx   data/plans.ts   lib/premium.ts
```
(Settings was orphaned in the old app — this phase makes it reachable.)

### Phase 10 — Hardening

- Accessibility pass: focus rings, AA contrast, keyboard path through every flow, reduced motion.
- Mobile pass using the mobile tab bar from Phase 2.
- Dark mode token parity.
- Performance: dynamic-import heavy libs (Rive, Lottie, code editor, confetti); check bundle per route.
- Delete leftovers, finalise ESLint boundaries, write `README` for the architecture.

### Later (not scheduled)

Build (guided projects), Assessments, Resources (under Paths), Notifications, Certificates, marketing landing page (research already in `devspace-landing-page-research.md`). Each becomes a new `features/<name>/` folder with its own route.

---

## 5. How each screen is migrated (the repeatable loop)

1. **Audit** the old files: list props, state, side effects, and which parts of `main.jsx` feed it.
2. **Types first**: write the TS types for the data it consumes.
3. **Logic + tests**: port pure functions and their tests; get green.
4. **UI**: port components one by one, splitting oversized files, replacing hard-coded hex with tokens, dropping `useMemo`/`useCallback`.
5. **Wire** to the feature's `api/` functions (mock-backed) and the route, with loading / error / empty states; remove prop-drilling from the old `main.jsx` handlers.
6. **Check**: side-by-side in the browser, lint, build.
7. **Commit** one phase (or sub-phase) per commit/PR.

## 6. Dependencies to carry over

| Package | Plan |
| --- | --- |
| `motion` | Keep — primary animation library |
| `gsap` | Used in onboarding. Either port to `motion` or keep; avoid shipping both long-term (§7) |
| `@rive-app/react-webgl2` | Keep (Phase 0). `react-canvas` is dropped — never imported |
| `@lottiefiles/dotlottie-react` | Keep (Phase 0) |
| `canvas-confetti` | Added in the phase that first fires it; lazy-load |
| `@dicebear/core` + `collection` | Added in the phase that first renders an avatar; lazy-load the collection |
| `cuelume` | Check what it is used for in `main.jsx` before deciding |
| dev: `vitest`, `@testing-library/react` | Add |

## 7. Decisions needed from you

1. **Backend contract:** does an API spec / OpenAPI / endpoint list already exist? If yes, `types/` and the `api/` functions are written from it; if not, I draft the contracts from the old data shapes and you review them with the backend.
2. **Theme default (light-first):** the design docs say light-first with brand `#19079B`, but the ideation code is dark-first. Plan assumes **light-first**; confirm.
3. **Navigation:** plan assumes top nav (Home / Paths / Practice / Build) with Leaderboard in the profile/header menu, per the design doc. Confirm, or choose a sidebar.
4. ~~Devy runtime~~ **Resolved:** Rive + Lottie, both set up in Phase 0, assets and WASM from a CDN in production.
5. **Animation library:** consolidate on `motion` only (port the `gsap` onboarding timelines), or keep both?
6. **Streak rule:** keep "any activity counts" for the port, or adopt the learning-evidence rule from `observation.md` before Phase 6?
7. **Scope of Leaderboard:** port it fully in Phase 8, or defer until a real XP/league accrual model exists?
8. ~~CDN~~ **Tigris**, wiring deferred. Local `public/` until then.
9. ~~Dark mode~~ **Resolved:** Tailwind `dark:` variants.
10. **Data fetching:** server components + `fetch`, or a client cache (TanStack Query / SWR) for mutations such as completing a lesson? Needed before Phase 2. My lean is server components for reads and TanStack Query for the interactive mutation-heavy parts (lesson, practice, leaderboard) — but that adds a dependency, so I will wait for your call.
11. **Auth:** the old gate was "no profile → onboarding". Will the backend use sessions/JWT, and should the gate become a real auth check?
