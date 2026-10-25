type OnboardingHeaderProps = {
  step: number;
  total: number;
  canGoBack: boolean;
  onBack: () => void;
};

export function OnboardingHeader({ step, total, canGoBack, onBack }: OnboardingHeaderProps) {
  return (
    <header className="flex items-center gap-4 px-6 max-[680px]:px-4">
      <button
        type="button"
        className="focus-ring grid size-10 flex-none place-items-center rounded-lg text-neutral-500 hover:text-ink disabled:opacity-30 dark:text-neutral-400 dark:hover:text-night-ink"
        onClick={onBack}
        disabled={!canGoBack}
        aria-label="Previous step"
      >
        <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m15 6-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800"
        role="progressbar"
        aria-label="Setup progress"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-[width] duration-500 ease-out dark:bg-blue-500"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </header>
  );
}
