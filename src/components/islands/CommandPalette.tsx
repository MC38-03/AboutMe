import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { overlayEvents } from "@/lib/events";
import type { OverlayData } from "@/lib/overlay";
import { toggleTheme } from "@/lib/theme";

interface Props {
  data: OverlayData;
}

type Group = "nav" | "projects" | "actions";

interface Command {
  id: string;
  group: Group;
  label: string;
  hint?: string;
  keywords: string;
  run: () => void;
}

function go(href: string) {
  window.location.href = href;
}

export default function CommandPalette({ data }: Props) {
  const s = data.strings;
  const id = useId();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const commands = useMemo<Command[]>(
    () => [
      {
        id: "home",
        group: "nav",
        label: s["palette.home"],
        keywords: "home top start",
        run: () => {
          go(`${data.home}#main`);
        },
      },
      ...data.sections.map((section) => ({
        id: `nav-${section.id}`,
        group: "nav" as const,
        label: section.label,
        keywords: section.id,
        run: () => {
          go(section.href);
        },
      })),
      ...data.projects.map((project) => ({
        id: `project-${project.id}`,
        group: "projects" as const,
        label: project.label,
        hint: project.summary,
        keywords: `${project.id} project case`,
        run: () => {
          go(project.href);
        },
      })),
      {
        id: "theme",
        group: "actions",
        label: s["palette.theme"],
        keywords: "theme dark light donker licht",
        run: () => {
          toggleTheme();
          close();
        },
      },
      {
        id: "copy",
        group: "actions",
        label: copied ? s["palette.copied"] : s["palette.copyEmail"],
        hint: data.email,
        keywords: "email mail copy kopieer",
        run: () => {
          void navigator.clipboard.writeText(data.email).then(() => {
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
            }, 1500);
          });
        },
      },
      {
        id: "cv",
        group: "actions",
        label: s["palette.cv"],
        keywords: "cv resume download",
        run: () => {
          go(data.cvPath);
        },
      },
      {
        id: "lang",
        group: "actions",
        label: s["palette.lang"],
        keywords: "language taal english nederlands",
        run: () => {
          go(data.otherLangHref);
        },
      },
      {
        id: "terminal",
        group: "actions",
        label: s["palette.terminal"],
        keywords: "terminal console shell easter egg",
        run: () => {
          close();
          window.dispatchEvent(new Event(overlayEvents.terminal));
        },
      },
      {
        id: "github",
        group: "actions",
        label: s["palette.github"],
        keywords: "github code source",
        run: () => {
          window.open(data.github, "_blank", "noopener");
        },
      },
      {
        id: "linkedin",
        group: "actions",
        label: s["palette.linkedin"],
        keywords: "linkedin",
        run: () => {
          window.open(data.linkedin, "_blank", "noopener");
        },
      },
    ],
    [data, s, copied, close],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.keywords}`.toLowerCase().includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => {
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(overlayEvents.palette, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(overlayEvents.palette, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      restoreRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setQuery("");
      setActive(0);
      window.dispatchEvent(new Event(overlayEvents.lock));
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      window.dispatchEvent(new Event(overlayEvents.unlock));
      restoreRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    document
      .getElementById(`${id}-option-${String(active)}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, id]);

  function onInputKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (filtered.length ? (i + 1) % filtered.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) =>
        filtered.length ? (i - 1 + filtered.length) % filtered.length : 0,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      filtered[active]?.run();
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      event.preventDefault();
    }
  }

  const groupLabel: Record<Group, string> = {
    nav: s["palette.group.nav"],
    projects: s["palette.group.projects"],
    actions: s["palette.group.actions"],
  };

  const listId = `${id}-list`;
  const activeId = filtered[active]
    ? `${id}-option-${String(active)}`
    : undefined;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.15 }}
        >
          <button
            type="button"
            aria-label={s["palette.keys.close"]}
            tabIndex={-1}
            className="absolute inset-0 cursor-default bg-bg/60 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={s["palette.label"]}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-2xl backdrop-blur-xl"
            initial={reduce ? false : { opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <svg
                className="size-5 shrink-0 text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKey}
                placeholder={s["palette.placeholder"]}
                aria-label={s["palette.placeholder"]}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={activeId}
                aria-autocomplete="list"
                className="h-14 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-muted"
              />
              <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted">
                esc
              </kbd>
            </div>

            <div
              id={listId}
              role="listbox"
              aria-label={s["palette.label"]}
              data-lenis-prevent
              className="max-h-[50vh] overflow-y-auto p-2"
            >
              {filtered.length === 0 && (
                <p
                  role="presentation"
                  className="px-3 py-8 text-center text-sm text-muted"
                >
                  {s["palette.empty"]}
                </p>
              )}
              {filtered.map((command, index) => {
                const showGroup =
                  index === 0 || filtered[index - 1]?.group !== command.group;
                const selected = index === active;
                return (
                  <div key={command.id} role="presentation">
                    {showGroup && (
                      <p className="px-3 pt-3 pb-1.5 font-mono text-[10px] tracking-widest text-muted uppercase">
                        {groupLabel[command.group]}
                      </p>
                    )}
                    <div
                      id={`${id}-option-${String(index)}`}
                      role="option"
                      aria-selected={selected}
                      tabIndex={-1}
                      onMouseMove={() => {
                        setActive(index);
                      }}
                      onClick={command.run}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") command.run();
                      }}
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        selected ? "bg-accent-soft text-fg" : "text-fg/90"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${selected ? "bg-accent" : "bg-border"}`}
                        />
                        <span className="truncate font-medium">
                          {command.label}
                        </span>
                      </span>
                      {command.hint && (
                        <span className="hidden max-w-[50%] truncate font-mono text-xs text-muted sm:block">
                          {command.hint}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 font-mono text-[10px] text-muted">
              <span>↑↓ {s["palette.keys.move"]}</span>
              <span>↵ {s["palette.keys.select"]}</span>
              <span>esc {s["palette.keys.close"]}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
