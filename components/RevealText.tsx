"use client";

import { useLayoutEffect, useRef, type ElementType, type Ref } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  createTextReveal,
  splitTextToWords,
  type RevealMode,
  type RevealSplit,
} from "@/lib/reveal-text";

type RevealTag = "p" | "h1" | "h2" | "h3" | "span" | "div";

interface RevealTextProps {
  text: string;
  as?: RevealTag;
  id?: string;
  mode?: RevealMode;
  split?: RevealSplit;
  blur?: number;
  y?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  end?: string;
  className?: string;
  wordClassName?: string;
}

export default function RevealText({
  text,
  as = "p",
  id,
  mode = "enter",
  split = "word",
  blur = 8,
  y = 24,
  duration = 1.2,
  stagger = 0.04,
  start = "top 90%",
  end = "top 35%",
  className,
  wordClassName,
}: RevealTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const Tag = as as ElementType;

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      createTextReveal(ref.current, {
        mode,
        split,
        blur,
        y,
        duration,
        stagger,
        start,
        end,
      });
    }, ref);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [mode, split, blur, y, duration, stagger, start, end]);

  if (split === "none") {
    return (
      <Tag ref={ref as Ref<HTMLElement>} id={id} className={className}>
        {text}
      </Tag>
    );
  }

  const words = splitTextToWords(text);

  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      id={id}
      aria-label={text}
      className={className}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden="true">
          <span data-reveal-word className={`inline-block ${wordClassName ?? ""}`}>
            {word}
          </span>
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}
