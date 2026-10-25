import { GameIcon, type GameIconName } from "~/components/ui/game-icon";
import { SparkleIcon } from "~/components/ui/icons";
import type { HomeUpdate } from "~/types/home";
import { CardCta } from "./card-cta";
import { IconChip } from "./icon-chip";

// The milestone's own illustration: a chest for a checkpoint, the bolt for a
// streak, coins for finishing a path.
const UPDATE_ART: Record<HomeUpdate["kind"], GameIconName> = {
  checkpoint: "treasure-chest",
  streak: "lightning-bolt",
  "streak-risk": "lightning-bolt",
  "path-complete": "coin-stack",
  welcome: "daily-tasks-notebook",
};

type UpdateFaceProps = {
  update: HomeUpdate;
  // The region (or path) the update is about.
  eyebrow: string;
  onAct: () => void;
};

// The "Next milestone" card on tablet and phone: the single real signal that
// matters most right now, and the action that answers it.
export function UpdateFace({ update, eyebrow, onAct }: UpdateFaceProps) {
  return (
    <>
      <span className="flex w-full items-center gap-2.5">
        <IconChip icon={SparkleIcon} tone="teal" />
        <span className="text-sm font-semibold text-ink-soft max-tab:text-xs dark:text-[#b6bac4]">Next milestone</span>
      </span>

      <span className="flex w-full flex-1 flex-col justify-center gap-[7px]">
        <GameIcon name={UPDATE_ART[update.kind]} className="mb-2 size-14 max-tab:size-12" />
        <span className="text-[11px] font-bold tracking-[0.08em] text-accent uppercase">{eyebrow}</span>
        <strong className="text-[22px] leading-tight text-neutral-800 max-tab:text-lg dark:text-night-ink">{update.title}</strong>
        <span className="max-w-[30ch] text-sm leading-[1.45] text-ink-soft max-tab:text-[13px] dark:text-[#b6bac4]">{update.body}</span>
      </span>

      <CardCta
        className="min-h-[52px] text-[17px] max-tab:text-[15px]"
        onClick={(event) => {
          event.stopPropagation();
          onAct();
        }}
      >
        {update.cta}
      </CardCta>
    </>
  );
}
