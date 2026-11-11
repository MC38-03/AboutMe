import { en } from "./en";
import { defaultLocale, type Locale } from "./locales";
import { nl } from "./nl";

const dictionaries = { nl, en } as const;

export type UiKey = keyof typeof nl;

export function useTranslations(lang: Locale) {
  return (key: UiKey): string => dictionaries[lang][key];
}

export function localePath(lang: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLocale) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

export function otherLocale(lang: Locale): Locale {
  return lang === "nl" ? "en" : "nl";
}
