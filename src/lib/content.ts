import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "@/i18n/locales";

export type Project = CollectionEntry<"projects">;
export type TimelineItem = CollectionEntry<"timeline">;

export function projectSlug(project: Project): string {
  return project.id.split("/").at(-1) ?? project.id;
}

export async function getProjects(lang: Locale): Promise<Project[]> {
  const projects = await getCollection(
    "projects",
    ({ data }) => data.lang === lang,
  );
  return projects.sort((a, b) => a.data.order - b.data.order);
}

export async function getTimeline(): Promise<TimelineItem[]> {
  const items = await getCollection("timeline");
  return items.sort((a, b) => a.data.start.localeCompare(b.data.start));
}
