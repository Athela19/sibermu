"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FASILITAS_MAHASISWA } from "@/lib/content";
import { splitTextToWords } from "@/lib/reveal-text";
import MediaSlot from "./MediaSlot";
import RevealText from "./RevealText";

const ID = "fasilitas-mahasiswa";
const ITEMS = FASILITAS_MAHASISWA;

const DECK_TILTS = [0, -2.5, 2, -1.5, 2.5, -2];

const deckTransform = (index: number, isActive: boolean, centered = false) => {
  const tilt = DECK_TILTS[index % DECK_TILTS.length];
  const shift = centered || tilt === 0 ? 0 : tilt > 0 ? 10 : -10;
  return `rotate(${tilt}deg) scale(${isActive ? 1 : 0.98}) translateX(${shift}px)`;
};

export default function FasilitasMahasiswa() {
  const rootRef = useRef<HTMLDivElement>(null);
  const desktopMediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileDriverRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [reduced] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  const isStatic = ITEMS.length <= 1 || reduced;

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (isStatic) return;

    const mm = gsap.matchMedia();
    const configs = [
      {
        query: "(min-width: 1024px)",
        start: "top center",
        end: "bottom center",
        refs: desktopMediaRefs,
      },
      {
        query: "(max-width: 1023px)",
        start: "top 70%",
        end: "bottom 30%",
        refs: mobileDriverRefs,
      },
    ];

    configs.forEach(({ query, start, end, refs }) => {
      mm.add(query, () => {
        const triggers = refs.current
          .map((el, i) => {
            if (!el) return null;
            return ScrollTrigger.create({
              trigger: el,
              start,
              end,
              onToggle: (self) => {
                if (self.isActive) setActive(i);
              },
            });
          })
          .filter((t) => t !== null);
        return () => triggers.forEach((t) => t.kill());
      });
    });

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      mm.revert();
    };
  }, [isStatic]);

  const wordsOf = (slots: number[]): HTMLElement[] => {
    const words: HTMLElement[] = [];
    slots.forEach((slot) => {
      const el = textItemRefs.current[slot];
      if (!el) return;
      el.querySelectorAll<HTMLElement>("[data-sticky-word]").forEach((w) =>
        words.push(w),
      );
    });
    return words;
  };

  useLayoutEffect(() => {
    if (isStatic) return;
    const slots = textItemRefs.current
      .map((_el, slot) => slot)
      .filter((slot) => textItemRefs.current[slot]);
    gsap.set(wordsOf(slots), { opacity: 0, y: 24, filter: "blur(8px)" });
  }, [isStatic]);

  const prevActiveRef = useRef(0);

  useLayoutEffect(() => {
    if (isStatic) return;
    const n = ITEMS.length;
    const prev = prevActiveRef.current;
    prevActiveRef.current = active;
    const allWords = wordsOf(ITEMS.flatMap((_, i) => [i, i + n]));
    const activeWords = wordsOf([active, active + n]);
    const prevWords = prev === active ? [] : wordsOf([prev, prev + n]);
    const keep = new Set([...activeWords, ...prevWords]);
    gsap.killTweensOf(allWords);
    gsap.set(
      allWords.filter((w) => !keep.has(w)),
      { opacity: 0, y: -24, filter: "blur(8px)" },
    );
    if (prevWords.length > 0) {
      gsap.to(prevWords, {
        opacity: 0,
        y: -24,
        filter: "blur(8px)",
        duration: 0.4,
        stagger: 0.02,
        ease: "power2.in",
        overwrite: "auto",
      });
    }
    if (activeWords.length === 0) return;
    gsap.fromTo(
      activeWords,
      { opacity: 0, y: 24, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.9,
        stagger: 0.035,
        ease: "power2.out",
        overwrite: "auto",
      },
    );
  }, [active, isStatic]);

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, ITEMS.length - 1));
    setActive(clamped);
    const target =
      window.innerWidth >= 1024
        ? desktopMediaRefs.current[clamped]
        : mobileDriverRefs.current[clamped];
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleItemKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goTo(index);
    }
  };

  const renderWords = (text: string) => {
    const words = splitTextToWords(text);
    return words.map((word, i) => (
      <span key={`${word}-${i}`} aria-hidden="true">
        <span data-sticky-word className="inline-block">
          {word}
        </span>
        {i < words.length - 1 ? " " : ""}
      </span>
    ));
  };

  const renderTextStack = (stackId: string, offset: number) => (
    <div id={stackId} aria-live="polite" aria-atomic="true" className="grid">
      {ITEMS.map((item, i) => {
        const isActive = i === active;
        return (
          <div
            key={item.title}
            ref={(el) => {
              textItemRefs.current[offset + i] = el;
            }}
            tabIndex={isActive ? 0 : -1}
            role="button"
            aria-current={isActive}
            aria-hidden={!isActive}
            aria-label={`${item.title} — item ${i + 1} dari ${ITEMS.length}`}
            onClick={() => goTo(i)}
            onKeyDown={(e) => handleItemKeyDown(e, i)}
            className={`col-start-1 row-start-1 mx-auto w-full max-w-md cursor-pointer px-2 py-5 text-center outline-none focus-visible:outline-[2px] focus-visible:outline-secondary focus-visible:outline-offset-4 lg:py-6 ${
              isActive ? "" : "pointer-events-none"
            }`}
          >
            <h3
              aria-label={item.title}
              className="font-display text-[1.5rem] font-semibold leading-[1.15] text-primary lg:text-[2rem]"
            >
              {renderWords(item.title)}
            </h3>
            <p
              aria-label={item.body}
              className="mt-3 font-sans text-base leading-[1.7] text-ink-900"
            >
              {renderWords(item.body)}
            </p>
          </div>
        );
      })}
    </div>
  );

  return (
    <section
      id="kemahasiswaan"
      aria-labelledby="fasilitas-heading"
      className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 lg:py-24"
    >
      <div
        ref={rootRef}
        id={ID}
        aria-label="Fasilitas Mahasiswa"
        className="relative w-full"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[calc(224px+36svh+14rem)] lg:bottom-[500px]">
          <div className="pointer-events-auto sticky top-16 z-20 -mx-6 px-6 py-3 text-center sm:-mx-8 sm:px-8 lg:top-[82px]">
            <RevealText
              as="h2"
              id="fasilitas-heading"
              text="Fasilitas Mahasiswa"
              className="mt-6 font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-primary sm:mt-8"
            />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="invisible -mx-6 px-6 py-3 text-center sm:-mx-8 sm:px-8"
        >
          <p className="mt-6 font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] sm:mt-8">
            Fasilitas Mahasiswa
          </p>
        </div>

        {/* Jarak header ke konten */}
        <div className="mt-16 sm:mt-20 lg:mt-28">
          {isStatic ? (
            <div className="flex flex-col gap-12">
              {ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="grid items-center gap-6 lg:grid-cols-12 lg:gap-16"
                >
                  <div className="lg:col-span-5">
                    <h3 className="font-display text-[1.5rem] font-semibold leading-[1.15] text-primary lg:text-[2rem]">
                      {item.title}
                    </h3>
                    <p className="mt-2 font-sans text-base leading-[1.7] text-ink-900">
                      {item.body}
                    </p>
                    {item.meta ? (
                      <p className="mt-2 font-sans text-sm font-medium text-ink-500">
                        {item.meta}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex justify-center lg:col-span-7">
                    <MediaSlot
                      label={item.mediaLabel}
                      ratio="4 / 3"
                      src={item.src}
                      alt={item.alt ?? item.title}
                      className="mx-auto w-full max-w-[560px] rounded-3xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* MOBILE: deck gambar + teks sticky */}
              <div className="sticky top-[224px] z-10 -mx-6 bg-paper/95 px-6 pb-4 pt-2 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:hidden">
                <div className="relative -mx-6 h-[36svh] min-h-[240px] overflow-hidden sm:-mx-8">
                  {ITEMS.map((item, i) => (
                    <div
                      key={item.title}
                      aria-hidden={i !== active}
                      style={{ transform: deckTransform(i, i === active, true) }}
                      className={`absolute inset-x-4 inset-y-3 transition-all duration-500 ease-out ${
                        i <= active
                          ? "translate-x-0"
                          : "pointer-events-none translate-x-[calc(100%+2rem)]"
                      }`}
                    >
                      <MediaSlot
                        label={item.mediaLabel}
                        ratio="auto"
                        src={item.src}
                        alt={item.alt ?? item.title}
                        className="h-full rounded-3xl"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-[10%]">
                  {renderTextStack(`${ID}-teks-mobile`, 0)}
                </div>
              </div>

              <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
                <div className="hidden lg:col-span-5 lg:block">
                  <div className="flex h-[420px] items-center justify-center lg:sticky lg:top-[280px] lg:self-start">
                    {renderTextStack(`${ID}-teks-desktop`, ITEMS.length)}
                  </div>
                </div>

                <div className="hidden lg:col-span-7 lg:block">
                  <div className="relative flex flex-col gap-[8vh]">
                    {ITEMS.map((item, i) => (
                      <div
                        key={item.title}
                        ref={(el) => {
                          desktopMediaRefs.current[i] = el;
                        }}
                        className="flex justify-center lg:sticky lg:top-[280px]"
                        style={{ zIndex: i + 1 }}
                      >
                        <div
                          className="mx-auto w-full max-w-[560px] overflow-hidden rounded-3xl bg-paper shadow-[0_12px_32px_rgba(16,24,40,0.12)] transition-transform duration-500 ease-out"
                          style={{
                            transform: deckTransform(i, i === active, true),
                          }}
                        >
                          <MediaSlot
                            label={item.mediaLabel}
                            ratio="4 / 3"
                            src={item.src}
                            alt={item.alt ?? item.title}
                            className="rounded-3xl"
                          />
                        </div>
                      </div>
                    ))}
                    <div aria-hidden="true" className="h-[10vh]" />
                  </div>
                </div>

                {/* MOBILE: elemen pemicu scroll */}
                <div className="flex flex-col gap-6 lg:hidden">
                  {ITEMS.map((item, i) => (
                    <div
                      key={item.title}
                      ref={(el) => {
                        mobileDriverRefs.current[i] = el;
                      }}
                      className="min-h-[70svh]"
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}