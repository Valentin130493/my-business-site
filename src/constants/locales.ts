export const LOCALE_RU = "ru";
export const LOCALE_EN = "en";
export const LOCALE_UK = "uk";
export const LOCALE_ME = "sr-ME";

export const SUPPORTED_LOCALES = [
  LOCALE_EN,
  LOCALE_UK,
  LOCALE_ME,
  LOCALE_RU,
] as const;

export const DEFAULT_LOCALE = LOCALE_RU;

export const LOCALE_PREFIXES = {
  [LOCALE_ME]: "/me",
} as const;

export const LOCALE_LABELS: Record<(typeof SUPPORTED_LOCALES)[number], string> =
  {
    [LOCALE_RU]: "RU",
    [LOCALE_EN]: "EN",
    [LOCALE_UK]: "UA",
    [LOCALE_ME]: "ME",
  };

export type SiteLocale = (typeof SUPPORTED_LOCALES)[number];

export const ABOUT_PATH = "/about";

export function localePath(locale: SiteLocale, path = ""): string {
  const prefixes: Partial<Record<SiteLocale, string>> = LOCALE_PREFIXES;
  return `${prefixes[locale] ?? `/${locale}`}${path}`;
}

export const OG_LOCALES: Record<SiteLocale, string> = {
  [LOCALE_RU]: "ru_RU",
  [LOCALE_EN]: "en_US",
  [LOCALE_UK]: "uk_UA",
  [LOCALE_ME]: "sr_ME",
};
