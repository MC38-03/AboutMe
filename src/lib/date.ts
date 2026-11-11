import type { Locale } from "@/i18n/locales";

const formatters = new Map<Locale, Intl.DateTimeFormat>();

export function formatMonth(value: string, lang: Locale): string {
  let format = formatters.get(lang);
  if (!format) {
    format = new Intl.DateTimeFormat(lang === "nl" ? "nl-NL" : "en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    formatters.set(lang, format);
  }
  return format.format(new Date(`${value}-01T00:00:00Z`));
}

export function formatRange(
  lang: Locale,
  present: string,
  start: string,
  end?: string,
  ongoing = false,
): string {
  if (end) return `${formatMonth(start, lang)} – ${formatMonth(end, lang)}`;
  if (ongoing) return `${formatMonth(start, lang)} – ${present}`;
  return formatMonth(start, lang);
}
