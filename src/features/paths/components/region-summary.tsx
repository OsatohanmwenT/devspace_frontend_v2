import { Button } from "~/components/ui/button";
import { BookOpenIcon, ChecklistIcon } from "~/components/ui/icons";
import { assetUrl } from "~/config/assets";
import type { DerivedRegion } from "../api/paths-api";

export type Resource = "cheatsheet" | "guidebook";

type RegionSummaryProps = {
  region: DerivedRegion;
  // Tailwind colour class for the "Region n" eyebrow.
  accent: string;
  onOpenResource: (resource: Resource) => void;
};

// The region the selected lesson belongs to: its art, summary and the two
// reference books. Pinned beside the route on desktop, folded into a row on
// tablet and a stack on phones.
export function RegionSummary({ region, accent, onOpenResource }: RegionSummaryProps) {
  return (
    <aside className="sticky top-[86px] grid grid-cols-1 gap-3.5 rounded-2xl border border-[#eeeeeb] bg-white px-7 pt-[26px] pb-7 shadow-[0_2px_6px_rgba(20,20,20,0.06)] max-[900px]:static max-[900px]:grid-cols-[120px_minmax(0,1fr)_auto] max-[900px]:items-center max-[900px]:p-[22px] max-tab:grid-cols-[92px_minmax(0,1fr)] max-tab:gap-x-4 max-tab:gap-y-3 max-tab:p-[18px] dark:border-night-line dark:bg-night-card dark:shadow-none">
      <div className="relative -mt-1.5 mb-1 grid min-h-[178px] place-items-center after:absolute after:bottom-[15px] after:left-1/2 after:h-3.5 after:w-[166px] after:-translate-x-1/2 after:rounded-full after:bg-black/12 max-[900px]:row-span-3 max-[900px]:m-0 max-[900px]:min-h-[120px] max-[900px]:after:bottom-[5px] max-[900px]:after:h-2.5 max-[900px]:after:w-[106px] max-tab:min-h-[92px] max-tab:after:bottom-[2px] max-tab:after:h-2 max-tab:after:w-20 dark:after:bg-black/50">
        {/* eslint-disable-next-line @next/next/no-img-element -- local path art */}
        <img
          className="relative z-1 block size-[174px] -rotate-2 object-contain max-[900px]:size-[118px] max-tab:size-[92px]"
          src={assetUrl(region.image)}
          alt=""
        />
      </div>
      <span className={`text-[11px] font-semibold tracking-[.1em] uppercase ${accent}`}>{region.level}</span>
      <h1 id="path-detail-title" className="-mt-0.5 text-[30px] font-semibold text-neutral-800 max-tab:text-[23px] dark:text-night-ink">
        {region.title}
      </h1>
      <p className="-mt-0.5 mb-1 max-w-[29ch] text-sm leading-[1.55] text-ink-soft max-[900px]:col-start-2 max-tab:col-span-full max-tab:mt-0 dark:text-night-soft">
        {region.summary}
      </p>
      <div className="mt-1 grid grid-cols-2 gap-3 border-t border-[#eeeeeb] pt-[18px] max-[900px]:col-start-3 max-[900px]:row-span-2 max-[900px]:border-t-0 max-[900px]:border-l max-[900px]:pt-0 max-[900px]:pl-[22px] max-tab:col-span-full max-tab:row-span-1 max-tab:border-t max-tab:border-l-0 max-tab:pt-3.5 max-tab:pl-0 dark:border-night-line">
        <Button variant="neutral" className="inline-flex min-h-11 items-center justify-center gap-2 px-3 text-xs font-semibold" onClick={() => onOpenResource("cheatsheet")}>
          <ChecklistIcon className="size-4" />
          Cheatsheet
        </Button>
        <Button variant="neutral" className="inline-flex min-h-11 items-center justify-center gap-2 px-3 text-xs font-semibold" onClick={() => onOpenResource("guidebook")}>
          <BookOpenIcon className="size-4" />
          Guidebook
        </Button>
      </div>
    </aside>
  );
}
