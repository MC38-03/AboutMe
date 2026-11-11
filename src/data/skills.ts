export type SkillGroupId = "languages" | "frontend" | "backend" | "tools";

export interface SkillGroup {
  id: SkillGroupId;
  items: readonly string[];
}

export const skillGroups: readonly SkillGroup[] = [
  {
    id: "languages",
    items: ["TypeScript", "JavaScript", "Java", "PHP", "HTML", "CSS"],
  },
  {
    id: "frontend",
    items: ["Angular", "Vue", "React", "Ionic", "Tailwind CSS", "Astro"],
  },
  {
    id: "backend",
    items: [
      "Firebase",
      "Cloud Firestore",
      "Spring Boot",
      "Supabase",
      "PostgreSQL",
      "Stripe",
      "AWS",
    ],
  },
  {
    id: "tools",
    items: ["Git", "GitHub Actions", "Docker", "Capacitor", "Vitest", "ESLint"],
  },
];
