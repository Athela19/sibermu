import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type RevealSplit = "word" | "none";
export type RevealMode = "enter" | "scrub";

export interface RevealOptions {
  split?: RevealSplit;
  mode?: RevealMode;
  blur?: number;
  y?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  end?: string;
}

const DEFAULTS: Required<RevealOptions> = {
  split: "word",
  mode: "enter",
  blur: 8,
  y: 24,
  duration: 1.2,
  stagger: 0.04,
  start: "top 90%",
  end: "top 35%",
};

export function splitTextToWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function createTextReveal(
  container: HTMLElement | null,
  options: RevealOptions = {},
): () => void {
  if (!container || typeof window === "undefined") return () => {};
  if (prefersReducedMotion()) return () => {};

  gsap.registerPlugin(ScrollTrigger);

  const opts = { ...DEFAULTS, ...options };
  const blur = Math.min(Math.max(opts.blur, 0), 8);
  const targets: HTMLElement[] =
    opts.split === "word"
      ? Array.from(container.querySelectorAll<HTMLElement>("[data-reveal-word]"))
      : [container];

  if (targets.length === 0) return () => {};

  gsap.set(targets, {
    opacity: 0,
    y: opts.y,
    filter: `blur(${blur}px)`,
    willChange: "filter, opacity, transform",
    force3D: true,
  });

  const toVars: gsap.TweenVars = {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    ease: "power2.out",
    overwrite: "auto",
    immediateRender: false,
    onComplete: () => {
      gsap.set(targets, { clearProps: "filter,willChange,transform" });
    },
  };

  let tween: gsap.core.Tween | undefined;

  if (opts.mode === "scrub") {
    tween = gsap.to(targets, {
      ...toVars,
      duration: 1,
      stagger: opts.stagger,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: opts.start,
        end: opts.end,
        scrub: 1,
        once: false,
        invalidateOnRefresh: true,
      },
    });
  } else {
    tween = gsap.to(targets, {
      ...toVars,
      duration: opts.duration,
      stagger: opts.stagger,
      scrollTrigger: {
        trigger: container,
        start: opts.start,
        once: true,
        toggleActions: "play none none none",
        invalidateOnRefresh: true,
      },
    });
  }

  return () => {
    tween?.scrollTrigger?.kill();
    tween?.kill();
    gsap.set(targets, { clearProps: "filter,willChange" });
  };
}
