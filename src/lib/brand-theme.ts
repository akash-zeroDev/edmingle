export const THEME_STORAGE_KEY = "classly-theme";

export type ThemePreset = {
  id: string;
  name: string;
  color: string;
};

export type StoredTheme = {
  id: string;
  color: string;
};

export const themePresets: ThemePreset[] = [
  { id: "royal-blue", name: "Royal Blue", color: "#2563EB" },
  { id: "indigo", name: "Indigo", color: "#4F46E5" },
  { id: "deep-blue", name: "Deep Blue", color: "#1D4ED8" },
  { id: "ocean-blue", name: "Ocean Blue", color: "#0369A1" },
  { id: "teal", name: "Teal", color: "#0F766E" },
  { id: "emerald", name: "Emerald", color: "#047857" },
  { id: "violet", name: "Violet", color: "#7C3AED" },
  { id: "slate-blue", name: "Slate Blue", color: "#475569" },
];

export const defaultTheme: ThemePreset = { id: "royal-blue", name: "Royal Blue", color: "#2563EB" };
export const defaultBrandTheme: StoredTheme = { id: defaultTheme.id, color: defaultTheme.color };

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(
    normalized.length === 3
      ? normalized.split("").map((character) => character + character).join("")
      : normalized,
    16
  );
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function mix(first: string, second: string, secondWeight: number) {
  const a = hexToRgb(first);
  const b = hexToRgb(second);
  return rgbToHex({
    r: a.r * (1 - secondWeight) + b.r * secondWeight,
    g: a.g * (1 - secondWeight) + b.g * secondWeight,
    b: a.b * (1 - secondWeight) + b.b * secondWeight,
  });
}

function channelLuminance(value: number) {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function contrast(first: string, second: string) {
  const lighter = Math.max(luminance(first), luminance(second));
  const darker = Math.min(luminance(first), luminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function safePrimary(color: string) {
  let result = /^#[0-9a-f]{6}$/i.test(color) ? color.toUpperCase() : defaultTheme.color;
  for (let attempt = 0; attempt < 8 && contrast(result, "#FFFFFF") < 4.5; attempt += 1) {
    result = mix(result, "#000000", 0.1);
  }
  return result;
}

export function createBrandPalette(color: string) {
  const primary = safePrimary(color);
  const foreground = contrast(primary, "#FFFFFF") >= 4.5 ? "#FFFFFF" : "#111827";
  return {
    "--primary": primary,
    "--primary-hover": mix(primary, "#000000", 0.1),
    "--primary-active": mix(primary, "#000000", 0.18),
    "--primary-light": mix(primary, "#FFFFFF", 0.94),
    "--primary-muted": mix(primary, "#FFFFFF", 0.84),
    "--primary-border": mix(primary, "#FFFFFF", 0.68),
    "--primary-foreground": foreground,
    "--ring": primary,
    "--accent": mix(primary, "#FFFFFF", 0.94),
    "--accent-foreground": mix(primary, "#000000", 0.18),
    "--sidebar-primary": primary,
    "--sidebar-primary-foreground": foreground,
  };
}

export function applyBrandTheme(theme: StoredTheme, animate = true) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (animate) root.classList.add("theme-transition");
  Object.entries(createBrandPalette(theme.color)).forEach(([property, value]) =>
    root.style.setProperty(property, value)
  );
  root.dataset["brandTheme"] = theme.id;
  if (animate) window.setTimeout(() => root.classList.remove("theme-transition"), 200);
}

export function getStoredTheme(): StoredTheme {
  if (typeof window === "undefined") return defaultBrandTheme;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (value) {
      const stored = JSON.parse(value) as Partial<StoredTheme>;
      if (stored.id && stored.color && /^#[0-9a-f]{6}$/i.test(stored.color)) {
        return { id: stored.id, color: stored.color.toUpperCase() };
      }
    }
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
  return defaultBrandTheme;
}

export function saveTheme(theme: StoredTheme) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // The selected theme still applies for the current session.
  }
}
