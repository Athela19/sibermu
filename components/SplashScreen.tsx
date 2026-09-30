"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { SITE } from "@/lib/site";

const LETTERS = ["S", "I", "B", "E", "R", "M", "U"];
/** Hard cap so splash never blocks indefinitely on broken images. */
const IMAGE_WAIT_TIMEOUT_MS = 10_000;

/**
 * Resolves when every `<img>` currently in the document has finished loading
 * (or errored), or when the timeout expires — whichever comes first.
 */
function waitForAllImages(timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img"));
    const pending = imgs.filter((img) => !img.complete);
    if (pending.length === 0) {
      resolve();
      return;
    }

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    let remaining = pending.length;
    const onDone = () => {
      remaining -= 1;
      if (remaining <= 0) settle();
    };

    for (const img of pending) {
      img.addEventListener("load", onDone, { once: true });
      img.addEventListener("error", onDone, { once: true });
    }

    setTimeout(settle, timeoutMs);
  });
}

export default function SplashScreen({
  onIntroDone,
}: {
  onIntroDone?: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onIntroDone);
  const finishedRef = useRef(false);
  const [done, setDone] = useState(false);
  const [logoOk, setLogoOk] = useState(true);

  useEffect(() => {
    doneRef.current = onIntroDone;
  }, [onIntroDone]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /* ── dual gate: animation done + images loaded ─────────────── */
    let animDone = false;
    let imgsDone = false;

    const tryFinish = () => {
      if (!animDone || !imgsDone) return;
      if (finishedRef.current) return;
      finishedRef.current = true;
      setDone(true);
      doneRef.current?.();
    };

    const onAnimDone = () => {
      animDone = true;
      tryFinish();
    };

    // Start waiting for images immediately (runs in parallel with anim).
    waitForAllImages(IMAGE_WAIT_TIMEOUT_MS).then(() => {
      imgsDone = true;
      tryFinish();
    });

    const textEl = root.querySelector<HTMLElement>("[data-splash-text]");
    const letterEls = Array.from(
      root.querySelectorAll<HTMLElement>("[data-splash-letter]"),
    );
    const textW = textEl?.offsetWidth ?? 0;
    const letterOffsets = letterEls.map((el) => el.offsetLeft);
    const shift = (8 + textW) / 2;

    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set("[data-splash-logo]", { opacity: 1, x: -shift });
        gsap.set("[data-splash-letter]", { opacity: 1, x: 0 });
        gsap.set("[data-splash-text]", { x: -shift });
        gsap.to(root, {
          opacity: 0,
          duration: 0.3,
          delay: 0.5,
          onComplete: onAnimDone,
        });
        return;
      }

      gsap.set("[data-splash-logo]", {
        opacity: 0,
        scale: 2.2,
        transformOrigin: "50% 50%",
        force3D: true,
      });
      gsap.set("[data-splash-text]", { x: -shift, force3D: true });
      gsap.set(letterEls, {
        opacity: 0,
        x: (i) => -(letterOffsets[i] + 40),
        force3D: true,
      });

      const tl = gsap.timeline({ onComplete: onAnimDone });
      tl.to(
        "[data-splash-logo]",
        {
          opacity: 1,
          scale: 1,
          duration: 1.0,
          ease: "power2.out",
          transformOrigin: "50% 50%",
          force3D: true,
        },
        0,
      );
      tl.to(
        "[data-splash-logo]",
        { x: -shift, duration: 0.8, ease: "power3.inOut", force3D: true },
        1.12,
      );
      tl.to(
        letterEls,
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: { each: 0.1, from: "end" },
          ease: "power3.out",
          force3D: true,
        },
        1.3,
      );
      tl.to(
        "[data-splash-lockup]",
        {
          scale: 1.4,
          opacity: 0,
          duration: 0.7,
          ease: "power2.in",
          transformOrigin: "50% 50%",
          force3D: true,
        },
        2.6,
      );
      tl.to(root, { opacity: 0, duration: 0.9, ease: "power1.in" }, 2.6);
    }, root);

    const fallback = window.setTimeout(() => {
      // Hard fallback: force both gates open after 4s + timeout margin.
      animDone = true;
      imgsDone = true;
      tryFinish();
    }, Math.max(4000, IMAGE_WAIT_TIMEOUT_MS + 1000));

    return () => {
      window.clearTimeout(fallback);
      ctx.revert();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      data-splash-root
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
    >
      <noscript>
        <style>{`[data-splash-root]{display:none}`}</style>
      </noscript>
      <div
        data-splash-lockup
        className="flex w-full items-center justify-center [will-change:transform,opacity]"
      >
        {logoOk ? (
          <div className="relative">
            <span
              data-splash-logo
              className="relative z-10 block h-20 w-20 opacity-0 [will-change:transform,opacity] sm:h-24 sm:w-24"
            >
              <Image
                src={SITE.splashLogo}
                alt=""
                width={96}
                height={96}
                priority
                fetchPriority="high"
                className="h-full w-full object-contain"
                onError={() => setLogoOk(false)}
              />
            </span>
            <span className="absolute left-full top-0 z-0 ml-2 flex h-full items-center">
              <span
                data-splash-text
                className="whitespace-nowrap font-display text-4xl font-semibold uppercase tracking-[0.08em] text-primary [will-change:transform] sm:text-5xl"
              >
                {LETTERS.map((ch, i) => (
                  <span
                    key={i}
                    data-splash-letter
                    className="inline-block opacity-0 [will-change:transform,opacity]"
                  >
                    {ch}
                  </span>
                ))}
              </span>
            </span>
          </div>
        ) : (
          <span
            data-splash-logo
            className="font-display text-5xl font-semibold lowercase text-primary opacity-0"
          >
            sibermu
          </span>
        )}
      </div>
    </div>
  );
}

