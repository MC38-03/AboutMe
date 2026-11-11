import { useId, useState, type SyntheticEvent } from "react";
import type { Locale } from "@/i18n/locales";
import { contactSchema, mailtoHref, type ContactField } from "@/lib/contact";
import { isFirebaseConfigured } from "@/lib/firebase/client";

interface Labels {
  name: string;
  email: string;
  message: string;
  honeypot: string;
  send: string;
  sending: string;
  success: string;
  error: string;
  errName: string;
  errEmail: string;
  errMessage: string;
}

interface Props {
  to: string;
  lang: Locale;
  labels: Labels;
}

type Status = "idle" | "sending" | "success" | "error";

const fieldClass =
  "w-full rounded-xl border border-border bg-bg/70 px-4 py-3 text-fg placeholder:text-muted/60 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 aria-invalid:border-red-500";

export default function ContactForm({ to, lang, labels }: Props) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>(
    {},
  );

  const errorText: Record<ContactField, string> = {
    name: labels.errName,
    email: labels.errEmail,
    message: labels.errMessage,
  };

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (typeof data.get("website") === "string" && data.get("website") !== "") {
      setStatus("success");
      return;
    }

    const result = contactSchema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
    });

    if (!result.success) {
      const next: Partial<Record<ContactField, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field === "name" || field === "email" || field === "message") {
          next[field] = errorText[field];
        }
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setStatus("sending");
    if (!isFirebaseConfigured) {
      window.location.href = mailtoHref(to, result.data);
      setStatus("success");
      return;
    }
    try {
      const { sendMessage } = await import("@/lib/firebase/messages");
      await sendMessage({ ...result.data, lang });
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const field = (name: ContactField) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });

  const error = (name: ContactField) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className="mt-1.5 text-sm text-red-500">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${id}-name`}
            className="mb-1.5 block text-sm font-medium"
          >
            {labels.name}
          </label>
          <input
            {...field("name")}
            type="text"
            autoComplete="name"
            maxLength={100}
            className={fieldClass}
          />
          {error("name")}
        </div>
        <div>
          <label
            htmlFor={`${id}-email`}
            className="mb-1.5 block text-sm font-medium"
          >
            {labels.email}
          </label>
          <input
            {...field("email")}
            type="email"
            autoComplete="email"
            maxLength={254}
            className={fieldClass}
          />
          {error("email")}
        </div>
      </div>

      <div>
        <label
          htmlFor={`${id}-message`}
          className="mb-1.5 block text-sm font-medium"
        >
          {labels.message}
        </label>
        <textarea
          {...field("message")}
          rows={5}
          maxLength={2000}
          className={`${fieldClass} resize-y`}
        />
        {error("message")}
      </div>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor={`${id}-website`}>{labels.honeypot}</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
        >
          {status === "sending" ? labels.sending : labels.send}
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {status === "success" && (
            <span className="text-accent">{labels.success}</span>
          )}
          {status === "error" && (
            <span className="text-red-500">
              {labels.error}{" "}
              <a href={`mailto:${to}`} className="underline">
                {to}
              </a>
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
