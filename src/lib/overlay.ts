import { site } from "@/data/site";
import { skillGroups } from "@/data/skills";
import type { Locale } from "@/i18n/locales";
import { nl } from "@/i18n/nl";
import {
  localePath,
  otherLocale,
  useTranslations,
  type UiKey,
} from "@/i18n/utils";
import { getProjects, projectSlug } from "@/lib/content";

export type OverlayKey = Extract<UiKey, `palette.${string}` | `term.${string}`>;
export type OverlayStrings = Record<OverlayKey, string>;

export interface OverlayLink {
  id: string;
  label: string;
  href: string;
}

export interface OverlayProject extends OverlayLink {
  summary: string;
}

export interface OverlayData {
  strings: OverlayStrings;
  home: string;
  sections: OverlayLink[];
  projects: OverlayProject[];
  skills: { label: string; items: readonly string[] }[];
  email: string;
  cvPath: string;
  github: string;
  linkedin: string;
  otherLangHref: string;
}

function isOverlayKey(key: string): key is OverlayKey {
  return key.startsWith("palette.") || key.startsWith("term.");
}

export async function getOverlayData(
  lang: Locale,
  path: string,
): Promise<OverlayData> {
  const t = useTranslations(lang);
  const home = localePath(lang);
  const strings = Object.fromEntries(
    Object.keys(nl)
      .filter(isOverlayKey)
      .map((key) => [key, t(key)]),
  ) as OverlayStrings;

  const sectionIds = [
    "about",
    "projects",
    "timeline",
    "skills",
    "ai",
    "contact",
  ] as const;

  const projects = await getProjects(lang);

  return {
    strings,
    home,
    sections: sectionIds.map((id) => ({
      id,
      label: t(`nav.${id}`),
      href: `${home}#${id}`,
    })),
    projects: projects.map((project) => ({
      id: projectSlug(project),
      label: project.data.title,
      summary: project.data.summary,
      href: localePath(lang, `/projects/${projectSlug(project)}`),
    })),
    skills: skillGroups.map((group) => ({
      label: t(`skills.group.${group.id}`),
      items: group.items,
    })),
    email: site.email,
    cvPath: site.cvPath,
    github: site.socials.github,
    linkedin: site.socials.linkedin,
    otherLangHref: localePath(otherLocale(lang), path),
  };
}
