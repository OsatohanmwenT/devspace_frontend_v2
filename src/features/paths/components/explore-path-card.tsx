import { assetUrl } from "~/config/assets";
import type { ExplorePath } from "../api/paths-api";
import { getFamilyAccent } from "../lib/family-accents";

export const pathKindLabel = (path: ExplorePath) => (path.type === "career" ? "Career path" : "Skill path");

// On phones the card turns into a row, art on the left and text beside it, so
// the catalogue scans like a list instead of one card per screen.
export function ExplorePathCard({ path, onSelect }: { path: ExplorePath; onSelect: () => void }) {
  return (
    <article className="flex h-full min-w-0 overflow-hidden rounded-3xl border border-[#e8e6e1] bg-white transition-[border-color,transform] focus-within:border-[#4169e1] hover:-translate-y-0.5 hover:border-[#4169e1] dark:border-night-line dark:bg-night-card">
      <button
        type="button"
        data-cuelume-press="pulse"
        data-cuelume-release="release"
        className="flex h-full w-full flex-col text-left max-tab:flex-row"
        onClick={onSelect}
        aria-label={`Open ${path.title} path`}
      >
        {/* A fixed art frame and a square image box, so every illustration
            gets the same footprint whatever its own proportions are. */}
        <div className={`grid h-40 flex-none place-items-center overflow-hidden max-tab:h-auto max-tab:w-[92px] ${getFamilyAccent(path.family).surface}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local learning-path art */}
          <img className="block size-28 object-contain max-tab:size-16" src={assetUrl(path.image)} alt="" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col border-t border-[#e8e6e1] bg-[#fdfcf9] p-[18px] max-tab:min-h-[136px] max-tab:justify-center max-tab:border-t-0 max-tab:border-l max-tab:p-3.5 dark:border-neutral-800 dark:bg-neutral-800">
          <div className="flex h-5 items-center justify-between gap-3">
            <span className="text-[11px] font-bold tracking-[.08em] text-[#525252] uppercase max-tab:text-[10px] dark:text-neutral-300">{pathKindLabel(path)}</span>
            {path.recommended && (
              <span className="rounded-full bg-[#4169e1]/15 px-2 py-0.5 text-[10px] leading-4 font-bold tracking-[.06em] text-[#4169e1] uppercase dark:text-[#84a5ff]">
                Recommended
              </span>
            )}
          </div>
          <h3 className="mt-2 text-xl leading-[1.15] font-medium text-neutral-800 max-tab:mt-1 max-tab:text-[17px] tab:truncate dark:text-night-ink" title={path.title}>
            {path.title}
          </h3>
          {/* Three lines reserved on every card whether used or not: a third
              line on only some cards knocks the tool chips out of line. */}
          <p className="mt-2 line-clamp-3 min-h-[4.5em] text-sm leading-normal text-ink-soft max-tab:mt-1 max-tab:line-clamp-2 max-tab:min-h-0 max-tab:text-[13px] dark:text-night-soft">
            {path.description}
          </p>
          <div className="mt-auto pt-4 max-tab:hidden">
            <div className="box-content flex h-[25px] flex-wrap gap-1.5 overflow-hidden border-t border-[#dededb] pt-3 dark:border-night-line">
              {path.tools.slice(0, 3).map((tool) => (
                <span key={tool} className="rounded-full bg-[#f1efe9] px-2.5 py-1 text-[11px] leading-[17px] text-[#525252] dark:bg-[#363636] dark:text-[#d4d4d4]">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}
