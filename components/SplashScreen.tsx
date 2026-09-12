"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { SITE } from "@/lib/site";

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

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setDone(true);
      doneRef.current?.();
    };

    const textEl = root.querySelector<HTMLElement>("[data-splash-text]");
    const textW = textEl?.offsetWidth ?? 0;
    const shift = (8 + textW) / 2;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set("[data-splash-logo]", { x: -shift });
      gsap.set("[data-splash-text]", { x: -shift });
      const t = window.setTimeout(() => {
        gsap.to(root, { opacity: 0, duration: 0.3, onComplete: finish });
      }, 500);
      return () => {
        window.clearTimeout(t);
      };
    }

    const tl = gsap.timeline({ onComplete: finish });
    tl.set("[data-splash-logo]", { opacity: 0, scale: 2.2 });
    tl.set("[data-splash-text]", { x: -shift });
    const letters = root.querySelectorAll<HTMLElement>("[data-splash-letter]");
    letters.forEach((el) => {
      gsap.set(el, { opacity: 0, x: -(el.offsetLeft + 40) });
    });
    tl.to(
      "[data-splash-logo]",
      { opacity: 1, scale: 1, duration: 1.0, ease: "power2.out" },
      0,
    );
    tl.to(
      "[data-splash-logo]",
      { x: -shift, duration: 0.8, ease: "power3.inOut" },
      1.1,
    );
    tl.to(
      letters,
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: { each: 0.1, from: "end" },
        ease: "power3.out",
      },
      1.1,
    );
    tl.to(
      "[data-splash-lockup]",
      { scale: 1.4, opacity: 0, duration: 0.7, ease: "power2.in" },
      2.6,
    );
    tl.to(root, { opacity: 0, duration: 0.9, ease: "power1.in" }, 2.6);

    const fallback = window.setTimeout(finish, 4000);
    return () => {
      window.clearTimeout(fallback);
      tl.kill();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
    >
      {logoOk ? (
        <div
          data-splash-lockup
          className="flex w-full items-center justify-center"
        >
          <div className="relative">
            <span
              data-splash-logo
              className="relative z-10 block h-20 w-20 sm:h-24 sm:w-24"
            >
              <Image
                src={SITE.splashLogo}
                alt=""
                fill
                sizes="96px"
                priority
                className="object-contain"
                onError={() => setLogoOk(false)}
              />
            </span>
            <span className="absolute left-full top-0 z-0 ml-2 flex h-full items-center">
            <span
              data-splash-text
              className="whitespace-nowrap font-display text-4xl font-semibold uppercase tracking-[0.08em] text-primary sm:text-5xl"
            >
              {"SIBERMU".split("").map((ch, i) => (
                <span key={i} data-splash-letter className="inline-block">
                  {ch}
                </span>
              ))}
            </span>
            </span>
          </div>
        </div>
      ) : (
        <div
          data-splash-lockup
          className="flex w-full items-center justify-center"
        >
          <span
            data-splash-logo
            className="font-display text-5xl font-semibold lowercase text-primary"
          >
            sibermu
          </span>
        </div>
      )}
    </div>
  );
}
