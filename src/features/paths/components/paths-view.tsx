"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useLoad } from "~/hooks/use-load";
import { useToast } from "~/providers/toast-provider";
import { getPaths, isAuthoredPath, startPath, type ExplorePath, type PathsData } from "../api/paths-api";
import { CustomPathCard } from "./custom-path-card";
import { ExplorePathCard } from "./explore-path-card";
import { PathPreviewDialog } from "./path-preview-dialog";
import { PathProgressCard } from "./path-progress-card";

type PathType = "all" | ExplorePath["type"];

const TYPE_FILTERS: [PathType, string][] = [
  ["all", "All"],
  ["career", "Career paths"],
  ["skill", "Skill paths"],
];

const matchesQuery = (path: ExplorePath, query: string) =>
  !query || [path.title, path.description, ...path.tools].join(" ").toLowerCase().includes(query);

function PathsContent({ data }: { data: PathsData }) {
  const router = useRouter();
  const toast = useToast();
  const [type, setType] = useState<PathType>("all");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<ExplorePath | null>(null);
  const { path, progress } = data;
  const nextLesson = progress.currentLesson?.title;

  const visiblePaths = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data.explorePaths.filter((candidate) => (type === "all" || candidate.type === type) && matchesQuery(candidate, term));
  }, [data.explorePaths, query, type]);

  // Authored paths have a roadmap to walk, so they get a page. Anything else is
  // just a confirm-before-committing step, so it opens over the grid.
  const select = (target: ExplorePath) => {
    if (isAuthoredPath(target.id)) router.push(`/paths/${target.id}`);
    else setPreview(target);
  };

  // Picking a path starts it, with an Undo in case the learner was only looking.
  const activate = async (id: string, title: string) => {
    const previous = await startPath(id);
    toast(`Now learning ${title}`, previous ? { label: "Undo", onClick: () => startPath(previous) } : undefined);
    router.push(`/paths/${id}`);
  };

  return (
    <main className="mx-auto w-[min(100%,1160px)] px-[22px] pt-8 pb-[72px] max-[900px]:px-[18px] max-tab:pt-6 max-tab:pb-10">
      <section className="grid gap-6 max-[720px]:gap-5" aria-label="Learning paths">
        <header className="grid max-w-[680px] gap-1">
          <h1 className="text-[26px] font-medium text-neutral-800 dark:text-night-ink">Paths</h1>
          <p className="text-[15px] leading-normal text-ink-soft dark:text-night-soft">Continue learning or choose a new path.</p>
        </header>

        <section className="grid gap-3" aria-labelledby="your-progress-title">
          <h2 id="your-progress-title" className="text-[19px] font-medium text-neutral-800 dark:text-night-ink">
            Your progress
          </h2>
          <div className="grid grid-cols-3 gap-3 max-[980px]:grid-cols-2 max-tab:grid-cols-1">
            <PathProgressCard
              title={path.title}
              subtitle={
                <>
                  {progress.percent}% complete
                  {nextLesson && (
                    <>
                      {" "}
                      <span aria-hidden="true">·</span> Next: {nextLesson}
                    </>
                  )}
                </>
              }
              progress={progress.percent}
              actionLabel="Open path"
              onOpen={() => router.push(`/paths/${path.id}`)}
            />
            {data.pausedCustomPaths.map((paused) => (
              <PathProgressCard
                key={paused.id}
                title={paused.title}
                subtitle={`Building: ${paused.project}`}
                badge="Custom"
                actionLabel="Resume"
                onOpen={() => activate(paused.id, paused.title)}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-4 border-t border-[#eeeeeb] pt-5 dark:border-night-line" aria-labelledby="explore-paths-title">
          <div className="flex items-center justify-between gap-4">
            <h2 id="explore-paths-title" className="text-[19px] font-medium text-neutral-800 dark:text-night-ink">
              Explore paths
            </h2>
            <span className="text-xs text-[#737371] dark:text-[#7d7d80]">{data.explorePaths.length} paths</span>
          </div>
          <div className="flex items-center justify-between gap-4 max-tab:flex-col max-tab:items-stretch">
            <div className="flex gap-2" role="group" aria-label="Path type">
              {TYPE_FILTERS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  data-cuelume-toggle
                  aria-pressed={type === value}
                  onClick={() => setType(value)}
                  className={`focus-ring min-h-10 rounded-xl border px-4 text-[13px] ${
                    type === value
                      ? "border-[#4169e1] bg-[#4169e1] font-semibold text-white"
                      : "border-[#d4d4d4] bg-white text-[#525252] dark:border-night-line dark:bg-[#252525] dark:text-night-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search paths"
              aria-label="Search paths"
              className="h-10 w-[280px] rounded-xl border border-[#d4d4d4] bg-white px-4 text-[13px] text-neutral-800 outline-none placeholder:text-[#737371] focus:border-[#4169e1] focus:ring-2 focus:ring-[#4169e1]/30 max-tab:w-full dark:border-[#4a4a4a] dark:bg-[#252525] dark:text-night-ink dark:placeholder:text-[#89898e]"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-tab:grid-cols-1">
            {visiblePaths.map((candidate) => (
              <ExplorePathCard key={candidate.id} path={candidate} onSelect={() => select(candidate)} />
            ))}
          </div>
        </section>

        <CustomPathCard onCreate={() => router.push("/paths/custom")} />
      </section>

      {preview && (
        <PathPreviewDialog
          path={preview}
          isActive={preview.id === data.activePathId}
          onClose={() => setPreview(null)}
          onStart={() => {
            activate(preview.id, preview.title);
            setPreview(null);
          }}
        />
      )}
    </main>
  );
}

export function PathsView() {
  const paths = useLoad(getPaths);
  if (paths.status !== "ready" || !paths.data) return <main className="min-h-[calc(100vh-64px)]" aria-busy="true" />;
  return <PathsContent data={paths.data} />;
}
