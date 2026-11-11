import type { nl } from "./nl";

export const en = {
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
  "hero.badge": "Software Engineering @ HvA",
  "hero.greeting": "Hi, I'm",
  "hero.role": "Software Engineering student & developer",
  "hero.intro":
    "I build web apps that people actually use. From a workout tracker I use every week to a budget app that shows what you can still spend.",
  "hero.cta.projects": "See projects",
  "hero.cta.contact": "Contact",
  "hero.cta.cv": "Download CV",
  "hero.scroll": "Scroll",
  "hero.portraitAlt": "Portrait of Muhammed Çetinkaya",
  "footer.built": "Built with Astro and Tailwind CSS.",
  "footer.source": "Source",
} as const satisfies Record<keyof typeof nl, string>;
