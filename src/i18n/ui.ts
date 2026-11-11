import { defaultLocale, type Locale } from "./locales";

export const ui = {
  nl: {
    "meta.description":
      "Muhammed Çetinkaya, software engineering-student aan de HvA. Ik bouw webapps met Angular, Vue, Spring Boot en Firebase.",
    "nav.projects": "Projecten",
    "nav.about": "Over mij",
    "nav.timeline": "Tijdlijn",
    "nav.contact": "Contact",
    "nav.skip": "Naar de inhoud",
    "nav.menu": "Menu",
    "theme.toggle": "Wissel tussen licht en donker",
    "lang.switch": "English",
    "hero.greeting": "Hoi, ik ben",
    "hero.role": "Software engineering-student aan de HvA",
    "hero.intro":
      "Ik bouw webapps die mensen echt gebruiken. Van een workout-tracker die ik zelf elke week gebruik tot een budget-app die laat zien wat je nog kunt uitgeven.",
    "hero.cta.projects": "Bekijk mijn projecten",
    "hero.cta.cv": "Download cv",
    "hero.portraitAlt": "Portretfoto van Muhammed Çetinkaya",
    "footer.built": "Gebouwd met Astro en Tailwind CSS.",
    "footer.source": "Broncode",
  },
  en: {
    "meta.description":
      "Muhammed Çetinkaya, software engineering student at Amsterdam University of Applied Sciences. I build web apps with Angular, Vue, Spring Boot and Firebase.",
    "nav.projects": "Projects",
    "nav.about": "About",
    "nav.timeline": "Timeline",
    "nav.contact": "Contact",
    "nav.skip": "Skip to content",
    "nav.menu": "Menu",
    "theme.toggle": "Toggle light and dark mode",
    "lang.switch": "Nederlands",
    "hero.greeting": "Hi, I'm",
    "hero.role": "Software engineering student in Amsterdam",
    "hero.intro":
      "I build web apps that people actually use. From a workout tracker I use every week to a budget app that shows what you can still spend.",
    "hero.cta.projects": "See my projects",
    "hero.cta.cv": "Download CV",
    "hero.portraitAlt": "Portrait of Muhammed Çetinkaya",
    "footer.built": "Built with Astro and Tailwind CSS.",
    "footer.source": "Source",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UiKey = keyof (typeof ui)[typeof defaultLocale];

export function useTranslations(lang: Locale) {
  return (key: UiKey): string => ui[lang][key];
}

export function localePath(lang: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === defaultLocale) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

export function otherLocale(lang: Locale): Locale {
  return lang === "nl" ? "en" : "nl";
}
