"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO } from "@/lib/content";
import { HERO_FPS, HERO_VIDEO_ENDED_EVENT, HERO_VIDEO_RESET_EVENT } from "@/lib/media";
import MediaSlot from "./MediaSlot";
import ScrollCue from "./ScrollCue";
import SplashScreen from "./SplashScreen";

const FETCH_CONCURRENCY = 6;
const CACHE_BEHIND = 2;
const CACHE_AHEAD = 5;
const MAX_DECODE_WIDTH = 2048;

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
  const cacheRef = useRef(new Map<number, ImageBitmap>());
  const inflightRef = useRef(new Set<number>());
  const indexRef = useRef(0);
  const naturalWRef = useRef(0);
  const apiRef = useRef<{
    show: (i: number) => void;
    repaint: () => void;
    wake: () => void;
    compact: () => void;
  } | null>(null);
  const endedSent = useRef(false);
  const [ready, setReady] = useState(frames.length === 0);
  const [failed, setFailed] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const heightVh = 100 * (1 + frames.length / HERO_FPS);

  useEffect(() => {
    if (frames.length === 0) return;
    let cancelled = false;
    let lastDir = 1;
    let warmerActive = false;
    const total = frames.length;
    const blobs: (Blob | null)[] = new Array(total).fill(null);
    const dead = new Set<number>();
    const cache = cacheRef.current;
    const inflight = inflightRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const decodeWidth = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvasRef.current?.clientWidth || window.innerWidth || 1280;
      const w = Math.max(320, Math.round(cssW * dpr));
      const naturalW = naturalWRef.current;
      const capped = Math.min(w, MAX_DECODE_WIDTH);
      return naturalW > 0 ? Math.min(capped, naturalW) : capped;
    };

    const decode = async (i: number): Promise<ImageBitmap | null> => {
      const blob = blobs[i];
      if (!blob) return null;
      try {
        return await createImageBitmap(blob, {
          resizeWidth: decodeWidth(),
          resizeQuality: "high",
        });
      } catch {
        try {
          return await createImageBitmap(blob);
        } catch {
          return null;
        }
      }
    };

    const evictFar = (behind = CACHE_BEHIND, ahead = CACHE_AHEAD) => {
      const cur = indexRef.current;
      cache.forEach((bmp, key) => {
        if (key < cur - behind || key > cur + ahead) {
          bmp.close();
          cache.delete(key);
        }
      });
    };

    const paintIndex = (i: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      let bmp = cache.get(i);
      if (!bmp) {
        for (let d = 1; d <= CACHE_AHEAD; d++) {
          bmp = cache.get(i - d) ?? cache.get(i + d);
          if (bmp) break;
        }
      }
      if (bmp) paint(canvas, bmp);
    };

    const store = (i: number, bmp: ImageBitmap) => {
      const old = cache.get(i);
      if (old) old.close();
      cache.set(i, bmp);
      evictFar();
      if (i === indexRef.current) paintIndex(i);
    };

    const keep = (i: number, bmp: ImageBitmap | null) => {
      if (!bmp) {
        dead.add(i);
        return;
      }
      if (
        i < indexRef.current - CACHE_BEHIND ||
        i > indexRef.current + CACHE_AHEAD
      ) {
        bmp.close();
        return;
      }
      store(i, bmp);
    };

    const ensure = (i: number) => {
      if (cancelled || i < 0 || i >= total) return;
      if (dead.has(i) || cache.has(i) || inflight.has(i) || !blobs[i]) return;
      inflight.add(i);
      void decode(i).then((bmp) => {
        inflight.delete(i);
        if (cancelled) {
          bmp?.close();
          return;
        }
        keep(i, bmp);
      });
    };

    const warmWindow = () => {
      if (warmerActive || reduced) return;
      warmerActive = true;
      void (async () => {
        try {
          while (!cancelled) {
            const cur = indexRef.current;
            const list: number[] = [];
            for (let d = 0; d <= CACHE_AHEAD; d++) list.push(cur + lastDir * d);
            for (let d = 1; d <= CACHE_BEHIND; d++) list.push(cur - lastDir * d);
            const next = list.find(
              (i) =>
                i >= 0 &&
                i < total &&
                !dead.has(i) &&
                !cache.has(i) &&
                !inflight.has(i) &&
                blobs[i],
            );
            if (next === undefined) break;
            inflight.add(next);
            const bmp = await decode(next);
            inflight.delete(next);
            if (cancelled) {
              bmp?.close();
              break;
            }
            keep(next, bmp);
            await new Promise((r) => setTimeout(r, 0));
          }
        } finally {
          warmerActive = false;
        }
      })();
    };

    const show = (i: number) => {
      const clamped = Math.max(0, Math.min(i, total - 1));
      if (clamped !== indexRef.current) {
        lastDir = clamped > indexRef.current ? 1 : -1;
        indexRef.current = clamped;
      }
      paintIndex(clamped);
      ensure(clamped);
      ensure(clamped + lastDir);
      ensure(clamped - lastDir);
      evictFar();
      warmWindow();
    };
    apiRef.current = {
      show,
      repaint: () => paintIndex(indexRef.current),
      wake: () => {
        const cur = indexRef.current;
        ensure(cur);
        ensure(cur + 1);
        ensure(cur - 1);
        warmWindow();
      },
      compact: () => evictFar(1, 1),
    };

    const fetchBlob = async (i: number) => {
      try {
        const res = await fetch(frames[i]);
        if (!res.ok) throw new Error(frames[i]);
        blobs[i] = await res.blob();
      } catch {
        dead.add(i);
      }
    };

    (async () => {
      try {
        await fetchBlob(0);
        if (cancelled) return;
        if (!blobs[0]) {
          setFailed(true);
          return;
        }
        try {
          const probe = await createImageBitmap(blobs[0]);
          naturalWRef.current = probe.width;
          probe.close();
        } catch {
        }
        if (cancelled) return;
        const first = await decode(0);
        if (cancelled) {
          first?.close();
          return;
        }
        if (!first) {
          setFailed(true);
          return;
        }
        cache.set(0, first);
        if (canvasRef.current) paint(canvasRef.current, first);
        setReady(true);
        show(indexRef.current);
        warmWindow();
        if (reduced) return;
        let cursor = 1;
        await Promise.all(
          Array.from(
            { length: Math.min(FETCH_CONCURRENCY, Math.max(total - 1, 0)) },
            async () => {
              while (!cancelled && cursor < total) {
                const i = cursor++;
                await fetchBlob(i);
                warmWindow();
              }
            },
          ),
        );
        warmWindow();
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      apiRef.current = null;
      cache.forEach((b) => b.close());
      cache.clear();
      inflight.clear();
      naturalWRef.current = 0;
    };
  }, [frames]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (frames.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const show = (i: number) => {
      if (apiRef.current) {
        apiRef.current.show(i);
      } else {
        indexRef.current = Math.max(0, Math.min(i, frames.length - 1));
      }
    };

    const trigger = ScrollTrigger.create({
      trigger: rootRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onEnter: () => apiRef.current?.wake(),
      onEnterBack: () => apiRef.current?.wake(),
      onLeave: () => apiRef.current?.compact(),
      onLeaveBack: () => apiRef.current?.compact(),
      onUpdate: (self) => {
        const i = Math.round(self.progress * (frames.length - 1));
        show(i);
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
      apiRef.current?.repaint();
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
      className="relative w-full bg-white"
      style={{ height: `${heightVh}vh` }}
    >
      <SplashScreen onIntroDone={() => setIntroDone(true)} />
      <div className="sticky top-0 z-10 h-[100svh] w-full overflow-clip">
        {frames.length > 0 && !failed ? (
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Rangkaian visual kemahasiswaan SiberMu"
            className="absolute inset-0 h-full w-full transition-opacity duration-700"
            style={{ opacity: ready && introDone ? 1 : 0 }}
          />
        ) : (
          <MediaSlot
            label="Slot frame hero — public/hero/scene1.webp dan seterusnya"
            ratio="16 / 9"
            className="absolute inset-0 aspect-auto h-full"
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-48"
          style={{
            background: "linear-gradient(transparent, rgba(255,255,255,0.55))",
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
