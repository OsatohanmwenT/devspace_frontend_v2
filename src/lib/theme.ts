export const THEME_STORAGE_KEY = "devspace-theme";

export type Theme = "light" | "dark";

// Runs in <head> before first paint so the `dark` class is on <html> before
// anything renders. A stored choice wins; otherwise the OS preference decides.
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;
