import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(2000),
});

export type ContactMessage = z.infer<typeof contactSchema>;
export type ContactField = keyof ContactMessage;

export function mailtoHref(to: string, message: ContactMessage): string {
  const subject = encodeURIComponent(`Portfolio: ${message.name}`);
  const body = encodeURIComponent(
    `${message.message}\n\n${message.name} <${message.email}>`,
  );
  return `mailto:${to}?subject=${subject}&body=${body}`;
}
