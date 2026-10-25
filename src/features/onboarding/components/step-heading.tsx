import { DevyLottie, DevyMood, type LottieClipName } from "~/components/devy";

// Devy stays present through the whole flow: a small companion beside every
// question rather than only on the break and welcome screens.
const LARGE_CLIPS = new Set<LottieClipName>(["walk", "thinking"]);

type StepHeadingProps = {
  title: string;
  subtitle?: string;
  devyClip?: LottieClipName;
};

export function StepHeading({ title, subtitle, devyClip }: StepHeadingProps) {
  return (
    <div className="grid w-full content-start gap-3 text-left sm:justify-items-center sm:text-center">
      {/* On narrow screens Devy sits to the right of a left-aligned title, so
          the title keeps most of the width instead of wrapping beside a
          centred mascot. */}
      <div className="flex flex-row-reverse items-center justify-between gap-3 sm:flex-row sm:justify-center">
        <span data-build data-build-order="0" className="flex-none">
          {devyClip ? (
            <DevyLottie
              clip={devyClip}
              className={`flex-none ${LARGE_CLIPS.has(devyClip) ? "size-16 sm:size-20" : "size-12 sm:size-14"}`}
            />
          ) : (
            <DevyMood mood="neutral" className="size-12 flex-none motion-safe:animate-devy-idle sm:size-14" />
          )}
        </span>
        <h1
          data-build
          data-build-order="1"
          className="m-0 min-w-0 flex-1 font-display text-2xl font-medium sm:max-w-[25ch] sm:flex-none sm:text-3xl"
        >
          {title}
        </h1>
      </div>
      {subtitle && (
        <p data-build data-build-order="2" className="text-muted m-0 max-w-[60ch] text-sm leading-normal sm:text-[15px]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
