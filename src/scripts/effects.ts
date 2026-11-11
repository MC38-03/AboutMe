import Lenis from "lenis";
import { overlayEvents } from "@/lib/events";

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

function setupLenis() {
  if (reduceMotion) return;
  const lenis = new Lenis({ autoRaf: true, anchors: { offset: -80 } });
  window.addEventListener(overlayEvents.lock, () => {
    lenis.stop();
  });
  window.addEventListener(overlayEvents.unlock, () => {
    lenis.start();
  });
}

function setupScrollEffects() {
  const bar = document.querySelector<HTMLElement>("[data-progress]");
  const lines = document.querySelectorAll<HTMLElement>("[data-draw]");

  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) {
      bar.style.transform = `scaleX(${String(max > 0 ? window.scrollY / max : 0)})`;
    }
    if (reduceMotion) return;
    lines.forEach((line) => {
      const box = (line.parentElement ?? line).getBoundingClientRect();
      const progress = (window.innerHeight * 0.7 - box.top) / box.height;
      line.style.setProperty(
        "--draw",
        String(Math.min(1, Math.max(0, progress))),
      );
    });
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

function trackPointer(element: HTMLElement, event: PointerEvent) {
  const box = element.getBoundingClientRect();
  const x = event.clientX - box.left;
  const y = event.clientY - box.top;
  element.style.setProperty("--mx", `${String(x)}px`);
  element.style.setProperty("--my", `${String(y)}px`);
  return { box, x, y };
}

function setupPointerEffects() {
  if (!finePointer) return;

  document.querySelectorAll<HTMLElement>("[data-spotlight]").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      trackPointer(el, event);
    });
  });

  if (reduceMotion) return;

  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const { box, x, y } = trackPointer(el, event);
      const rx = (y / box.height - 0.5) * -7;
      const ry = (x / box.width - 0.5) * 9;
      el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });

  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (event) => {
      const box = el.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      el.style.transform = `translate(${(dx * 0.25).toFixed(1)}px, ${(dy * 0.35).toFixed(1)}px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });
}

const glyphs = "!<>-_\\/[]{}=+*^?#01";

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

function scramble(el: HTMLElement, delay: number) {
  const target = el.textContent;
  const chars = Array.from(segmenter.segment(target), (part) => part.segment);
  const duration = 900;
  let start: number | undefined;

  const frame = (now: number) => {
    start ??= now + delay;
    const elapsed = now - start;
    if (elapsed < 0) {
      requestAnimationFrame(frame);
      return;
    }
    const progress = Math.min(1, elapsed / duration);
    const revealed = Math.floor(progress * chars.length);
    el.textContent = chars
      .map((char, i) => {
        if (i < revealed || char === " ") return char;
        return glyphs[Math.floor(Math.random() * glyphs.length)] ?? char;
      })
      .join("");
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = target;
  };

  requestAnimationFrame(frame);
}

function setupScramble() {
  if (reduceMotion) return;
  document.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el, i) => {
    scramble(el, 250 + i * 180);
  });
}

function setupShortcutLabels() {
  const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
  if (isMac) return;
  document.querySelectorAll<HTMLElement>("[data-shortcut]").forEach((el) => {
    el.textContent = "Ctrl K";
  });
}

function setupOverlayTriggers() {
  document.querySelectorAll<HTMLElement>("[data-open]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.dataset.open === "terminal" ? "terminal" : "palette";
      window.dispatchEvent(new Event(overlayEvents[target]));
    });
  });
}

setupLenis();
setupScrollEffects();
setupPointerEffects();
setupScramble();
setupShortcutLabels();
setupOverlayTriggers();
