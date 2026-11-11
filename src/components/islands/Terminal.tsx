import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type SyntheticEvent,
  type KeyboardEvent,
} from "react";
import { overlayEvents } from "@/lib/events";
import type { OverlayData } from "@/lib/overlay";

interface Props {
  data: OverlayData;
}

type LineKind = "in" | "out" | "err" | "accent";

interface Line {
  id: number;
  kind: LineKind;
  text: string;
}

const lineClass: Record<LineKind, string> = {
  in: "text-white",
  out: "text-white/70",
  err: "text-[#f87171]",
  accent: "text-[#34d399]",
};

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

export default function Terminal({ data }: Props) {
  const s = data.strings;
  const id = useId();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<Line[]>(() => [
    { id: 0, kind: "accent", text: data.strings["term.welcome"] },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const counter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  function line(kind: LineKind, text: string): Line {
    counter.current += 1;
    return { id: counter.current, kind, text };
  }

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "`" && !isTyping(event.target)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    const onOpen = () => {
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(overlayEvents.terminal, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(overlayEvents.terminal, onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  function run(raw: string): Line[] {
    const [command = "", ...args] = raw.trim().split(/\s+/);
    const name = command.toLowerCase();
    const out = (text: string, kind: LineKind = "out") => line(kind, text);

    switch (name) {
      case "":
        return [];
      case "help":
        return (
          [
            ["help", s["term.help.help"]],
            ["whoami", s["term.help.whoami"]],
            ["projects", s["term.help.projects"]],
            ["open <slug>", s["term.help.open"]],
            ["skills", s["term.help.skills"]],
            ["contact", s["term.help.contact"]],
            ["clear", s["term.help.clear"]],
            ["exit", s["term.help.exit"]],
          ] as const
        ).map(([cmd, text]) => out(`${cmd.padEnd(14)}${text}`));
      case "whoami":
        return [out(s["term.whoami"])];
      case "projects":
      case "ls":
        return data.projects.map((p) => out(`${p.id.padEnd(14)}${p.summary}`));
      case "open":
      case "cd": {
        const target = (args[0] ?? "").toLowerCase();
        const project = data.projects.find((p) => p.id === target);
        if (!project) return [out(`${s["term.notFound"]} ${target}`, "err")];
        setTimeout(() => {
          window.location.href = project.href;
        }, 400);
        return [out(`${s["term.opening"]} ${project.label}...`, "accent")];
      }
      case "skills":
        return data.skills.map((group) =>
          out(`${group.label.padEnd(18)}${group.items.join(", ")}`),
        );
      case "contact":
        return [
          out(`email     ${data.email}`),
          out(`linkedin  ${data.linkedin}`),
          out(`github    ${data.github}`),
        ];
      case "sudo":
        return [out(s["term.sudo"], "err")];
      case "gta6":
      case "gta":
        return [out(s["term.gta"], "accent")];
      default:
        return [
          out(`${s["term.unknown"]} ${name}`, "err"),
          out(s["term.tryHelp"]),
        ];
    }
  }

  function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const value = input;
    setInput("");
    setCursor(-1);
    if (value.trim()) setHistory((h) => [value, ...h].slice(0, 30));

    const name = value.trim().toLowerCase();
    if (name === "clear") {
      setLines([]);
      return;
    }
    if (name === "exit") {
      setOpen(false);
      return;
    }
    setLines((current) => [...current, line("in", value), ...run(value)]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      setCursor(next);
      setInput(history[next] ?? "");
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = Math.max(cursor - 1, -1);
      setCursor(next);
      setInput(next === -1 ? "" : (history[next] ?? ""));
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-label={s["term.label"]}
          className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0e]/95 font-mono text-sm shadow-2xl backdrop-blur-xl sm:bottom-6"
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <button
              type="button"
              aria-label={s["term.close"]}
              onClick={() => {
                setOpen(false);
              }}
              className="size-3 rounded-full bg-[#ff5f57] transition hover:brightness-110"
            />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-xs text-white/50">
              guest@muhammed: ~
            </span>
          </div>
          <div
            data-lenis-prevent
            className="h-72 overflow-y-auto px-4 py-3 leading-relaxed"
            aria-live="polite"
          >
            {lines.map((l) => (
              <p
                key={l.id}
                className={`break-words whitespace-pre-wrap ${lineClass[l.kind]}`}
              >
                {l.kind === "in" && <span className="text-[#34d399]">$ </span>}
                {l.text}
              </p>
            ))}
            <form onSubmit={submit} className="flex items-center gap-2">
              <label htmlFor={`${id}-input`} className="text-[#34d399]">
                $<span className="sr-only">{s["term.input"]}</span>
              </label>
              <input
                id={`${id}-input`}
                ref={inputRef}
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                }}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="flex-1 bg-transparent text-white caret-[#34d399] outline-none"
              />
            </form>
            <div ref={bottomRef} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
