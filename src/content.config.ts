import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const locale = z.enum(["nl", "en"]);

const localized = z.object({ nl: z.string().min(1), en: z.string().min(1) });

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM");

const projects = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        lang: locale,
        summary: z.string().min(1).max(200),
        kind: z.enum(["personal", "school", "internship"]),
        status: z.enum(["live", "in-progress", "finished"]),
        period: z.object({ start: yearMonth, end: yearMonth.optional() }),
        order: z.number().int().nonnegative(),
        featured: z.boolean().default(false),
        icon: z
          .enum(["dumbbell", "discussion", "wallet", "code"])
          .default("code"),
        role: z.string().min(1),
        team: z.string().optional(),
        stack: z.array(z.string().min(1)).min(1),
        problem: z.string().min(1),
        features: z.array(z.string().min(1)).min(1),
        challenges: z.array(z.string().min(1)),
        learned: z.array(z.string().min(1)),
        cover: image().optional(),
        coverAlt: z.string().optional(),
        links: z
          .object({
            live: z.url().optional(),
            repo: z.url().optional(),
          })
          .default({}),
      })
      .refine((p) => p.cover === undefined || p.coverAlt !== undefined, {
        message: "coverAlt is required when a cover is set",
        path: ["coverAlt"],
      }),
});

const timeline = defineCollection({
  loader: file("src/content/timeline/timeline.json"),
  schema: z.object({
    id: z.string().min(1),
    start: yearMonth,
    end: yearMonth.optional(),
    current: z.boolean().default(false),
    kind: z.enum(["education", "work", "internship", "volunteer", "milestone"]),
    title: localized,
    org: z.string().optional(),
    description: localized,
  }),
});

export const collections = { projects, timeline };
