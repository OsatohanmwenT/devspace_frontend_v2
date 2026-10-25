// Shared look for things you pick from. Flat on purpose: a bordered surface
// when unselected and the Teams blue fill when selected.
export function optionSurface(selected: boolean) {
  return selected
    ? "border border-blue-600 bg-blue-600 text-white"
    : "border border-[#d4d4d4] bg-white text-neutral-800 hover:border-[#737371] dark:border-transparent dark:bg-neutral-700/80 dark:text-[#e4e4e6] dark:hover:bg-neutral-600/80";
}

export function isChosen(value: unknown, optionValue: string | number) {
  return Array.isArray(value) ? value.includes(optionValue) : value === optionValue;
}
