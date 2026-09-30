"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

import { KOMPETISI } from "@/lib/content";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const CLOUD_SIZE = 640;
const SPHERE_RADIUS = 210;
const ICON_RENDER_SIZE = 80;
const ICON_HALF = ICON_RENDER_SIZE / 2;

/* ------------------------------------------------------------------ */
/*  Easing                                                             */
/* ------------------------------------------------------------------ */

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Kompetisi() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const rotationRef = useRef({ x: 0, y: 0 });
  const iconCanvasesRef = useRef<HTMLCanvasElement[]>([]);
  const imagesLoadedRef = useRef<boolean[]>([]);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const mousePosRef = useRef({ x: CLOUD_SIZE / 2, y: CLOUD_SIZE / 2 });

  const [active, setActive] = useState<number | null>(null);
  const prefersReducedMotion = React.useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const isPaused = userPaused !== null ? userPaused : prefersReducedMotion;
  const [targetRotation, setTargetRotation] = useState<{
    x: number;
    y: number;
    startX: number;
    startY: number;
    startTime: number;
    duration: number;
  } | null>(null);

  const count = KOMPETISI.length;

  /* --- Sphere positions (Fibonacci) -------------------------------- */
  const positions = React.useMemo(() => {
    const n = count || 1;
    const offset = 2 / n;
    const increment = Math.PI * (3 - Math.sqrt(5));
    return Array.from({ length: n }, (_, i) => {
      const y = i * offset - 1 + offset / 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = i * increment;
      return {
        x: Math.cos(phi) * r * SPHERE_RADIUS,
        y: y * SPHERE_RADIUS,
        z: Math.sin(phi) * r * SPHERE_RADIUS,
        id: i,
      };
    });
  }, [count]);


  /* --- Pre-render logo images to off-screen canvases --------------- */
  useEffect(() => {
    imagesLoadedRef.current = new Array(count).fill(false);
    iconCanvasesRef.current = KOMPETISI.map((item, index) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = ICON_RENDER_SIZE * 2;
      offscreen.height = ICON_RENDER_SIZE * 2;
      const ctx = offscreen.getContext("2d");
      if (ctx && item.src) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = item.src;
        img.onload = () => {
          ctx.clearRect(0, 0, offscreen.width, offscreen.height);
          ctx.beginPath();
          ctx.arc(
            ICON_RENDER_SIZE,
            ICON_RENDER_SIZE,
            ICON_RENDER_SIZE,
            0,
            Math.PI * 2,
          );
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(
            img,
            0,
            0,
            ICON_RENDER_SIZE * 2,
            ICON_RENDER_SIZE * 2,
          );
          imagesLoadedRef.current[index] = true;
        };
      }
      return offscreen;
    });
  }, [count]);

  /* --- Hit-test helper --------------------------------------------- */
  const hitTest = useCallback(
    (cx: number, cy: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return -1;
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);

      let bestIdx = -1;
      let bestDepth = -Infinity;

      for (const pos of positions) {
        const rx = pos.x * cosY - pos.z * sinY;
        const rz = pos.x * sinY + pos.z * cosY;
        const ry = pos.y * cosX + rz * sinX;
        const rz2 = -pos.y * sinX + rz * cosX;

        const sx = canvas.width / 2 + rx;
        const sy = canvas.height / 2 + ry;
        const scale = (rz2 + 420) / 540;
        const hitRadius = Math.max(32, (ICON_HALF + 8) * scale);

        const dx = cx - sx;
        const dy = cy - sy;
        if (dx * dx + dy * dy < hitRadius * hitRadius && rz2 > bestDepth) {
          bestDepth = rz2;
          bestIdx = pos.id;
        }
      }
      return bestIdx;
    },
    [positions],
  );

  const selectItem = useCallback(
    (hit: number) => {
      const pos = positions[hit];
      if (!pos) return;
      const targetX = -Math.atan2(
        pos.y,
        Math.sqrt(pos.x * pos.x + pos.z * pos.z),
      );
      const targetY = Math.atan2(pos.x, pos.z);
      const cur = rotationRef.current;
      const dist = Math.sqrt(
        (targetX - cur.x) ** 2 + (targetY - cur.y) ** 2,
      );
      setTargetRotation({
        x: targetX,
        y: targetY,
        startX: cur.x,
        startY: cur.y,
        startTime: performance.now(),
        duration: Math.min(2000, Math.max(800, dist * 1000)),
      });
      setActive(hit);
    },
    [positions],
  );

  /* --- Mouse / touch handlers -------------------------------------- */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const rect = canvas?.getBoundingClientRect();
      if (!canvas || !rect) return;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const hit = hitTest(x, y);
      if (hit >= 0) {
        selectItem(hit);
        return;
      }

      if (e.pointerType !== "touch") {
        isDraggingRef.current = true;
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
        try {
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
        } catch {}
      }
    },
    [hitTest, selectItem],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const rect = canvas?.getBoundingClientRect();
      if (canvas && rect) {
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        mousePosRef.current = {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
      }
      if (isDraggingRef.current) {
        rotationRef.current = {
          x: rotationRef.current.x + (e.clientY - lastMouseRef.current.y) * 0.002,
          y: rotationRef.current.y + (e.clientX - lastMouseRef.current.x) * 0.002,
        };
        lastMouseRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [],
  );

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  /* --- Animation loop ---------------------------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let running = true;

    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cX = canvas.width / 2;
      const cY = canvas.height / 2;
      const mp = mousePosRef.current;

      /* Targeted rotation animation */
      if (targetRotation) {
        const elapsed = performance.now() - targetRotation.startTime;
        const progress = Math.min(1, elapsed / targetRotation.duration);
        const eased = easeOutCubic(progress);
        rotationRef.current = {
          x:
            targetRotation.startX +
            (targetRotation.x - targetRotation.startX) * eased,
          y:
            targetRotation.startY +
            (targetRotation.y - targetRotation.startY) * eased,
        };
        if (progress >= 1) setTargetRotation(null);
      } else if (!isDraggingRef.current && !isPaused) {
        /* Idle auto-rotation influenced by mouse */
        const dx = mp.x - cX;
        const dy = mp.y - cY;
        const maxDist = Math.sqrt(cX * cX + cY * cY);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 0.002 + (dist / maxDist) * 0.006;
        rotationRef.current = {
          x: rotationRef.current.x + (dy / canvas.height) * speed,
          y: rotationRef.current.y + (dx / canvas.width) * speed,
        };
      }

      /* Projection & draw */
      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);

      // Sort back-to-front
      const sorted = positions
        .map((pos) => {
          const rx = pos.x * cosY - pos.z * sinY;
          const rz = pos.x * sinY + pos.z * cosY;
          const ry = pos.y * cosX + rz * sinX;
          const rz2 = -pos.y * sinX + rz * cosX;
          return { ...pos, sx: cX + rx, sy: cY + ry, depth: rz2 };
        })
        .sort((a, b) => a.depth - b.depth);

      for (const p of sorted) {
        const scale = (p.depth + 420) / 540;
        const opacity = Math.max(0.2, Math.min(1, (p.depth + 220) / 360));
        const isActive = p.id === active;

        ctx.save();
        ctx.translate(p.sx, p.sy);
        ctx.scale(scale, scale);
        ctx.globalAlpha = opacity;

        if (iconCanvasesRef.current[p.id] && imagesLoadedRef.current[p.id]) {
          /* Grayscale for non-active */
          if (!isActive) ctx.filter = "grayscale(100%)";
          ctx.drawImage(
            iconCanvasesRef.current[p.id],
            -ICON_HALF,
            -ICON_HALF,
            ICON_RENDER_SIZE,
            ICON_RENDER_SIZE,
          );
          ctx.filter = "none";
        } else {
          /* Placeholder circle */
          ctx.beginPath();
          ctx.arc(0, 0, ICON_HALF, 0, Math.PI * 2);
          ctx.fillStyle = isActive
            ? "rgba(0,124,196,0.6)"
            : "rgba(255,255,255,0.15)";
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "bold 22px sans-serif";
          ctx.fillText(KOMPETISI[p.id]?.title?.charAt(0) ?? "", 0, 0);
        }

        /* Active ring */
        if (isActive) {
          ctx.beginPath();
          ctx.arc(0, 0, ICON_HALF + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.85)";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.restore();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      running = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [positions, active, isPaused, targetRotation]);

  if (count === 0) return null;
  const item = active !== null ? KOMPETISI[active] : null;

  return (
    <section
      id="kompetisi"
      aria-labelledby="kompetisi-heading"
      className="relative z-10 -mt-px flex min-h-[100svh] w-full items-center overflow-hidden bg-primary"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 pb-12 pt-6 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-16">
        {/* Teks — reaktif mengikuti logo aktif */}
        <div className="order-2 lg:order-1">
          <div aria-live="polite" className="max-w-xl min-h-[120px]">
            {item ? (
              <>
                <h2
                  id="kompetisi-heading"
                  className="font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-white transition-opacity duration-300"
                >
                  {item.title}
                </h2>
                <p className="mt-4 font-sans text-[1.05rem] leading-7 text-white/70 transition-opacity duration-300">
                  {item.body}
                </p>
              </>
            ) : (
              <>
                <h2
                  id="kompetisi-heading"
                  className="font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-white"
                >
                  Kompetisi
                </h2>
                <p className="mt-4 font-sans text-[1.05rem] leading-7 text-white/70">
                  Pilih logo untuk melihat detail kompetisi.
                </p>
              </>
            )}
          </div>

          {/* Mobile quick competition selector pills */}
          <div className="mt-6 flex flex-wrap gap-2 lg:hidden" role="tablist" aria-label="Daftar Kompetisi">
            {KOMPETISI.map((comp, idx) => (
              <button
                key={comp.title}
                type="button"
                role="tab"
                aria-selected={idx === active}
                onClick={() => selectItem(idx)}
                className={`rounded-full px-3.5 py-1.5 font-sans text-xs font-semibold transition ${
                  idx === active
                    ? "bg-white text-primary shadow"
                    : "bg-white/10 text-white/80 hover:bg-white/20 active:bg-white/30"
                }`}
              >
                {comp.title}
              </button>
            ))}
          </div>
        </div>

        {/* Icon Cloud */}
        <div className="relative order-1 mx-auto flex items-center justify-center lg:order-2">
          <canvas
            ref={canvasRef}
            width={CLOUD_SIZE}
            height={CLOUD_SIZE}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="w-full max-w-[640px] aspect-square cursor-grab touch-pan-y lg:touch-none active:cursor-grabbing"
            style={{ width: "100%", maxWidth: CLOUD_SIZE, height: "auto", aspectRatio: "1 / 1" }}
            aria-label="Logo kompetisi interaktif — klik untuk tampilkan deskripsi"
            role="img"
          />
          {/* Play/Pause control (a11y: WCAG 2.2.2) */}
          <button
            onClick={() => setUserPaused(!isPaused)}
            aria-label={isPaused ? "Putar animasi" : "Jeda animasi"}
            className="absolute right-2 top-2 rounded-full bg-white/10 p-2 text-white/60 backdrop-blur transition hover:bg-white/20 hover:text-white"
          >
            {isPaused ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
