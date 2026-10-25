import { accentStyle } from "../lib/accents";

type ScenePagerProps = {
  cards: readonly { id: string; label: string; accent: string }[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

// A click-to-jump rail under the stack: makes "this is a paged set of four
// things" explicit instead of leaving swipe and arrow keys as the only way to
// discover it. Tablet only; phones swipe.
export function ScenePager({ cards, activeIndex, onSelect }: ScenePagerProps) {
  return (
    <div className="-mt-2 flex items-center justify-center gap-2 max-tab:hidden" role="tablist" aria-label="Choose a card">
      {cards.map((card, index) => (
        <button
          key={card.id}
          type="button"
          role="tab"
          aria-selected={index === activeIndex}
          aria-label={card.label}
          className={`focus-ring h-2 flex-none rounded-full transition-[width,background-color] duration-300 ease-out ${
            index === activeIndex
              ? "w-6 bg-accent"
              : "w-2 bg-black/40 hover:bg-accent/55 dark:bg-white/20"
          }`}
          style={accentStyle(card.accent)}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}
