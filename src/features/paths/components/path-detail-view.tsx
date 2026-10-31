"use client";

import { AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { ChevronLeftIcon } from "~/components/ui/icons";
import { useLoad } from "~/hooks/use-load";
import { chooseFramework, getPathDetail, type PathDetailData } from "../api/paths-api";
import { usePinnedRegion } from "../hooks/use-pinned-region";
import { useLessonLaunch } from "../hooks/use-lesson-launch";
import { getCheatsheetPersonalization } from "../lib/cheatsheet-personalization";
import { getFamilyAccent } from "../lib/family-accents";
import { getRegionTopics } from "../lib/reference";
import lessonAudio from "../data/lesson-audio.json";
import { CheatsheetDrawer } from "./cheatsheet-drawer";
import { FrameworkCheckpoint } from "./framework-checkpoint";
import { GuidebookView } from "./guidebook-view";
import { LaunchScene } from "./launch-scene";
import { LessonBar } from "./lesson-bar";
import { LessonAudioDialog } from "./lesson-audio-dialog";
import { LessonPreviewDialog } from "./lesson-preview-dialog";
import { RegionSection } from "./region-section";
import { RegionSummary, type Resource } from "./region-summary";

function PathDetail({ data }: { data: PathDetailData }) {
  const router = useRouter();
  const { path, progress, profile } = data;
  const lessons = progress.regions.flatMap((region) => region.lessons);
  const currentLesson = progress.currentLesson ?? lessons[0];
  const [selectedId, setSelectedId] = useState(currentLesson.id);
  const [resource, setResource] = useState<Resource | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [listening, setListening] = useState(false);
  const [frameworkReady, setFrameworkReady] = useState(data.frameworkCheckpointReady);
  const launch = useLessonLaunch(path.id, path.title, data.activePathId, progress.currentLesson?.id ?? null);
  const pinnedId = usePinnedRegion(path.id);

  const selected = lessons.find((lesson) => lesson.id === selectedId) ?? currentLesson;
  const audioLesson = lessonAudio[selected.id as keyof typeof lessonAudio];
  const selectedRegion = progress.regions.find((region) => region.lessons.some((lesson) => lesson.id === selected.id)) ?? progress.regions[0];
  const accent = getFamilyAccent(path.family).text;
  const goBack = () => router.push("/paths");

  // A long route would bury the current lesson below the fold; land on it.
  useEffect(() => {
    document.querySelector("[data-current-lesson]")?.scrollIntoView({ block: "center" });
  }, [path.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (listening) setListening(false);
      else if (previewing) setPreviewing(false);
      else if (!resource) router.push("/paths");
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [listening, previewing, resource, router]);

  return (
    <main className="mx-auto w-[min(100%,1160px)] px-[22px] pt-8 pb-8 max-[900px]:px-[18px] max-tab:pt-6" aria-labelledby="path-detail-title">
      <button
        type="button"
        data-cuelume-press="pulse"
        data-cuelume-release="release"
        onClick={goBack}
        className="focus-ring mb-[18px] inline-flex min-h-11 items-center gap-2 rounded-lg text-[15px] font-semibold text-neutral-800 hover:text-[#073c72] dark:text-night-ink dark:hover:text-[#88bdf2]"
      >
        <ChevronLeftIcon className="size-5" />
        My learning
      </button>

      <div className="grid grid-cols-[minmax(340px,420px)_minmax(0,700px)] items-start justify-between gap-14 max-[900px]:grid-cols-1 max-[900px]:gap-9 max-tab:gap-6">
        <RegionSummary region={selectedRegion} accent={accent} onOpenResource={setResource} />

        <div className="mx-auto grid w-[min(100%,700px)] min-w-0 grid-cols-[minmax(0,1fr)] gap-12">
          {frameworkReady && (
            <FrameworkCheckpoint
              onChoose={async (framework) => {
                await chooseFramework(framework);
                setFrameworkReady(false);
              }}
            />
          )}
          {progress.regions.map((region) => (
            <RegionSection
              key={region.id}
              region={region}
              pinned={pinnedId === region.id}
              selectedLessonId={selected.id}
              flight={launch.flight}
              onSelect={setSelectedId}
              onStart={(lessonId) => {
                setSelectedId(lessonId);
                launch.start(lessonId);
              }}
            />
          ))}
          <LessonBar
            lesson={selected}
            started={launch.startedIds.includes(selected.id)}
            flying={launch.flight !== null}
            onStart={() => launch.start(selected.id)}
            onDetails={() => setPreviewing(true)}
            onListen={audioLesson ? () => setListening(true) : undefined}
          />
        </div>
      </div>

      {resource === "cheatsheet" && (
        <CheatsheetDrawer
          subtitle={selectedRegion.title}
          topics={getRegionTopics(selectedRegion.id)}
          personalization={getCheatsheetPersonalization(profile)}
          onClose={() => setResource(null)}
        />
      )}
      {resource === "guidebook" && <GuidebookView key={selectedRegion.id} region={selectedRegion} onClose={() => setResource(null)} />}
      {previewing && (
        <LessonPreviewDialog
          title={selected.title}
          onClose={() => setPreviewing(false)}
          onShowCurrent={() => {
            setPreviewing(false);
            setSelectedId(currentLesson.id);
          }}
        />
      )}
      {listening && audioLesson && <LessonAudioDialog lesson={audioLesson} onClose={() => setListening(false)} />}
      <AnimatePresence>{launch.flight && launch.flight.phase !== "liftoff" && <LaunchScene key="launch-scene" />}</AnimatePresence>
    </main>
  );
}

export function PathDetailView({ pathId }: { pathId: string }) {
  const router = useRouter();
  const load = useCallback(() => getPathDetail(pathId), [pathId]);
  const detail = useLoad(load);

  if (detail.status === "loading") return <main className="min-h-[calc(100vh-64px)]" aria-busy="true" />;
  if (detail.status === "error" || !detail.data) {
    return (
      <main className="mx-auto grid min-h-[60vh] max-w-[700px] content-center justify-items-start gap-4 px-5 text-ink dark:text-night-ink">
        <h1 className="text-2xl font-semibold">Path not found</h1>
        <p className="text-ink-soft dark:text-night-soft">Choose a path from the learning library.</p>
        <Button className="min-h-11 px-5" onClick={() => router.push("/paths")}>
          Browse paths
        </Button>
      </main>
    );
  }
  return <PathDetail data={detail.data} />;
}
