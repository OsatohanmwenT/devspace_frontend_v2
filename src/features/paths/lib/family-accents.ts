// Each family of paths has a colour of its own. Class names are written out in
// full so Tailwind can see them; `custom` and anything unknown fall back to backend.
type FamilyAccent = {
  // The eyebrow colour on the detail page.
  text: string;
  // The art backdrop on an explore card. Dark cards stay plain.
  surface: string;
};

const FAMILY_ACCENTS: Record<string, FamilyAccent> = {
  ml: {
    text: "text-[#4169e1]",
    surface: "bg-[color-mix(in_srgb,rgba(65,105,225,0.16)_70%,#fafaf8)] dark:bg-transparent",
  },
  data: {
    text: "text-[#04adc0]",
    surface: "bg-[color-mix(in_srgb,rgba(4,173,192,0.16)_70%,#fafaf8)] dark:bg-transparent",
  },
  backend: {
    text: "text-[#88bdf2]",
    surface: "bg-[color-mix(in_srgb,rgba(136,189,242,0.16)_70%,#fafaf8)] dark:bg-transparent",
  },
  security: {
    text: "text-[#a9d94e]",
    surface: "bg-[color-mix(in_srgb,rgba(169,217,78,0.16)_70%,#fafaf8)] dark:bg-transparent",
  },
};

export const getFamilyAccent = (family: string) => FAMILY_ACCENTS[family] ?? FAMILY_ACCENTS.backend;
