"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import MediaSlot from "./MediaSlot";
import { KOMPETISI } from "@/lib/content";

const BALL_SLOTS = 20;
const BALL_RADIUS_PCT = 34;
const BALL_SIZE_MIN = 35;
const BALL_SIZE_MAX = 74;
const BALL_OPACITY_MIN = 0.4;
const COS_X = Math.cos((-15 * Math.PI) / 180);
const SIN_X = Math.sin((-15 * Math.PI) / 180);
const FIB_OFFSET = 2 / BALL_SLOTS;
const FIB_INCREMENT = Math.PI * (3 - Math.sqrt(5));

type PoolEntry = { item: (typeof KOMPETISI)[number]; compIndex: number };
type SlotDef = { x: number; y: number; z: number; owner: PoolEntry };

function makeSlots(pool: PoolEntry[]): SlotDef[] {
  if (pool.length === 0) return [];
  return Array.from({ length: BALL_SLOTS }, (_, i) => {
    const y = i * FIB_OFFSET - 1 + FIB_OFFSET / 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const phi = i * FIB_INCREMENT;
    return {
      x: Math.cos(phi) * r,
      y,
      z: Math.sin(phi) * r,
      owner: pool[i % pool.length],
    };
  });
}

function projectDepth(slot: SlotDef, ryDeg: number) {
  const ry = (ryDeg * Math.PI) / 180;
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const x1 = slot.x * cosY - slot.z * sinY;
  const z1 = slot.x * sinY + slot.z * cosY;
  const y1 = slot.y * COS_X - z1 * SIN_X;
  const z2 = slot.y * SIN_X + z1 * COS_X;
  return { x: x1, y: y1, depth: (z2 + 1) / 2 };
}

function frontCompIndex(slots: SlotDef[], ryDeg: number) {
  let best = 0;
  let bestDepth = -Infinity;
  for (let i = 0; i < slots.length; i++) {
    const depth = projectDepth(slots[i], ryDeg).depth;
    if (depth > bestDepth) {
      bestDepth = depth;
      best = slots[i].owner.compIndex;
    }
  }
  return best;
}

export default function Kompetisi() {
  const sectionRef = useRef<HTMLElement>(null);
  const count = KOMPETISI.length;

  const pool: PoolEntry[] = useMemo(() => {
    const entries = KOMPETISI.map((item, compIndex) => ({ item, compIndex }));
    const withSrc = entries.filter((entry) => entry.item.src);
    return withSrc.length > 0 ? withSrc : entries;
  }, []);

  const slots = useMemo(() => makeSlots(pool), [pool]);

  const [active, setActive] = useState(() => frontCompIndex(slots, 0));
  const [orbit, setOrbit] = useState(0);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = sectionRef.current;
    if (!el || count === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${window.innerHeight * 0.2}`,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        onUpdate: (self) => {
          const rotation = self.progress * 360;
          const index = frontCompIndex(slots, rotation);
          setActive((prev) => (prev === index ? prev : index));
          setOrbit(rotation);
        },
      });
    }, el);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [count, slots]);

  if (count === 0) return null;
  const item = KOMPETISI[active];

  const select = (index: number) => {
    setActive(((index % count) + count) % count);
  };

  const activate =
    (compIndex: number) => (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        select(compIndex);
      }
    };

  return (
    <section
      ref={sectionRef}
      id="kompetisi"
      aria-labelledby="kompetisi-heading"
      className="relative z-10 -mt-px flex min-h-[100svh] w-full items-center overflow-hidden bg-primary"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 pb-12 pt-6 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div className="order-2 lg:order-1">
          <div aria-live="polite" className="max-w-xl">
            <h2
              id="kompetisi-heading"
              className="font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] text-white"
            >
              {item.title}
            </h2>
            <p className="mt-4 font-sans text-[1.05rem] leading-7 text-white/70">
              {item.body}
            </p>
          </div>
        </div>

        <div
          role="group"
          aria-label="Logo kompetisi — pilih untuk tampilkan deskripsi"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") select(active - 1);
            if (e.key === "ArrowRight") select(active + 1);
          }}
          className="relative order-1 mx-auto aspect-square w-full max-w-[520px] lg:order-2"
        >
          {slots.map((slot, i) => {
            const compIndex = slot.owner.compIndex;
            const isActive = compIndex === active;
            const p = projectDepth(slot, orbit);
            const size = Math.round(
              BALL_SIZE_MIN + p.depth * (BALL_SIZE_MAX - BALL_SIZE_MIN),
            );
            const top = (50 - p.y * BALL_RADIUS_PCT).toFixed(2);
            const left = (50 + p.x * BALL_RADIUS_PCT).toFixed(2);
            const opacity = (
              BALL_OPACITY_MIN +
              p.depth * (1 - BALL_OPACITY_MIN)
            ).toFixed(2);
            return (
              <figure
                key={i}
                tabIndex={0}
                role="button"
                aria-pressed={isActive}
                aria-label={`${slot.owner.item.title} — tampilkan deskripsi`}
                onClick={() => select(compIndex)}
                onKeyDown={activate(compIndex)}
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  width: size,
                  height: size,
                  transform: "translate(-50%, -50%)",
                  opacity,
                  zIndex: Math.round(p.depth * 10),
                }}
                className={`absolute cursor-pointer overflow-hidden rounded-full outline-none transition duration-500 ${
                  isActive ? "scale-110 grayscale-0 ring-2 ring-white/70" : "grayscale"
                }`}
              >
                <MediaSlot
                  label={slot.owner.item.mediaLabel}
                  ratio="1 / 1"
                  src={slot.owner.item.src}
                  alt={slot.owner.item.alt ?? ""}
                  className="rounded-full"
                />
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
