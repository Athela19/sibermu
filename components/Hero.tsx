"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO } from "@/lib/content";
import { HERO_FPS, HERO_VIDEO_ENDED_EVENT, HERO_VIDEO_RESET_EVENT } from "@/lib/media";
import MediaSlot from "./MediaSlot";
import ScrollCue from "./ScrollCue";

function paint(canvas: HTMLCanvasElement, bmp: ImageBitmap) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(canvas.clientWidth * dpr);
  const h = Math.round(canvas.clientHeight * dpr);
  if (w === 0 || h === 0) return;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const scale = Math.max(w / bmp.width, h / bmp.height);
  const dw = bmp.width * scale;
  const dh = bmp.height * scale;
  ctx.drawImage(bmp, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export default function Hero({ frames }: { frames: string[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const bitmapsRef = useRef<ImageBitmap[]>([]);
  const indexRef = useRef(0);
  const endedSent = useRef(false);
  const [ready, setReady] = useState(frames.length === 0);
  const [failed, setFailed] = useState(false);
  const heightVh = 100 * (1 + frames.length / HERO_FPS);

  useEffect(() => {
    if (frames.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await Promise.all(
          frames.map(async (src) => {
            const res = await fetch(src);
            if (!res.ok) throw new Error(src);
            return createImageBitmap(await res.blob());
          }),
        );
        if (cancelled) {
          list.forEach((b) => b.close());
          return;
        }
        bitmapsRef.current = list;
        if (canvasRef.current) paint(canvasRef.current, list[0]);
        setReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      bitmapsRef.current.forEach((b) => b.close());
      bitmapsRef.current = [];
    };
  }, [frames]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (frames.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const show = (i: number) => {
      if (i === indexRef.current) return;
      indexRef.current = i;
      const bmp = bitmapsRef.current[i];
      if (canvasRef.current && bmp) paint(canvasRef.current, bmp);
    };

    const trigger = ScrollTrigger.create({
      trigger: rootRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        show(Math.round(self.progress * (frames.length - 1)));
        if (cueRef.current) {
          cueRef.current.style.opacity = String(
            Math.max(0, 1 - self.progress * 4),
          );
        }
        if (self.progress >= 0.98 && !endedSent.current) {
          endedSent.current = true;
          window.dispatchEvent(new Event(HERO_VIDEO_ENDED_EVENT));
        } else if (self.progress < 0.9 && endedSent.current) {
          endedSent.current = false;
          window.dispatchEvent(new Event(HERO_VIDEO_RESET_EVENT));
        }
      },
    });
    ScrollTrigger.refresh();

    const onResize = () => {
      const bmp = bitmapsRef.current[indexRef.current];
      if (canvasRef.current && bmp) paint(canvasRef.current, bmp);
    };
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
      trigger.kill();
    };
  }, [frames]);

  return (
    <section
      ref={rootRef}
      id="beranda"
      aria-label="Beranda — animasi frame SiberMu"
      className="relative w-full bg-navy-900"
      style={{ height: `${heightVh}vh` }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-clip">
        {frames.length > 0 && !failed ? (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Rangkaian visual kemahasiswaan SiberMu"
            className="absolute inset-0 h-full w-full"
            style={{ opacity: ready ? 1 : 0 }}
          />
        ) : (
          <MediaSlot
            label="Slot frame hero — public/hero/scene1.jpg dan seterusnya"
            ratio="16 / 9"
            className="absolute inset-0 aspect-auto h-full"
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-48"
          style={{
            background: "linear-gradient(transparent, rgba(26,42,91,0.55))",
          }}
        />

        <div
          ref={cueRef}
          className="absolute inset-x-0 bottom-8 z-10 flex justify-center"
        >
          <ScrollCue target={HERO.scrollTarget} />
        </div>
      </div>
    </section>
  );
}
